package controller

import (
	"context"
	"fmt"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	netv1 "k8s.io/api/networking/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/util/intstr"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	gearpitiov1alpha1 "github.com/nordiwnd/gearpit/operator/api/v1alpha1"
)

// PreviewEnvReconciler reconciles a PreviewEnv object
type PreviewEnvReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

// +kubebuilder:rbac:groups=core.gearpit.io,resources=previewenvs,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=core.gearpit.io,resources=previewenvs/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=apps,resources=deployments,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=core,resources=services,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=networking.k8s.io,resources=ingresses,verbs=get;list;watch;create;update;patch;delete

const (
	fieldOwner = "preview-env-controller"
)

func (r *PreviewEnvReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	logger := log.FromContext(ctx)

	var previewEnv gearpitiov1alpha1.PreviewEnv
	if err := r.Get(ctx, req.NamespacedName, &previewEnv); err != nil {
		return ctrl.Result{}, client.IgnoreNotFound(err)
	}

	logger.Info("Reconciling PreviewEnv", "PR", previewEnv.Spec.PRNumber)

	applyResource := func(obj client.Object) error {
		if err := ctrl.SetControllerReference(&previewEnv, obj, r.Scheme); err != nil {
			return err
		}
		return r.Patch(ctx, obj, client.Apply, client.ForceOwnership, client.FieldOwner(fieldOwner))
	}

	// --- App Deployment ---
	appLabels := map[string]string{"app": "gearpit-app", "instance": req.Name}
	deploy := &appsv1.Deployment{
		TypeMeta: metav1.TypeMeta{Kind: "Deployment", APIVersion: "apps/v1"},
		ObjectMeta: metav1.ObjectMeta{Name: req.Name + "-app", Namespace: req.Namespace, Labels: appLabels},
		Spec: appsv1.DeploymentSpec{
			Selector: &metav1.LabelSelector{MatchLabels: appLabels},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{Labels: appLabels},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{{
						Name:  "app",
						Image: "ghcr.io/nordiwnd/gearpit/app:" + previewEnv.Spec.ImageTag,
						Ports: []corev1.ContainerPort{{ContainerPort: 8080}},
						Env:   []corev1.EnvVar{{Name: "DB_HOST", Value: req.Name + "-db"}},
					}},
				},
			},
		},
	}
	if err := applyResource(deploy); err != nil {
		return ctrl.Result{}, err
	}

	// --- App Service ---
	svc := &corev1.Service{
		TypeMeta: metav1.TypeMeta{Kind: "Service", APIVersion: "v1"},
		ObjectMeta: metav1.ObjectMeta{Name: req.Name + "-app", Namespace: req.Namespace, Labels: appLabels},
		Spec: corev1.ServiceSpec{
			Selector: appLabels,
			Ports:    []corev1.ServicePort{{Port: 80, TargetPort: intstr.FromInt(8080)}},
		},
	}
	if err := applyResource(svc); err != nil {
		return ctrl.Result{}, err
	}

	// --- Ingress ---
	host := fmt.Sprintf("pr-%d.gearpit.nip.io", previewEnv.Spec.PRNumber)
	ingress := &netv1.Ingress{
		TypeMeta: metav1.TypeMeta{Kind: "Ingress", APIVersion: "networking.k8s.io/v1"},
		ObjectMeta: metav1.ObjectMeta{Name: req.Name, Namespace: req.Namespace, Labels: appLabels},
		Spec: netv1.IngressSpec{
			Rules: []netv1.IngressRule{{
				Host: host,
				IngressRuleValue: netv1.IngressRuleValue{
					HTTP: &netv1.HTTPIngressRuleValue{
						Paths: []netv1.HTTPIngressPath{{
							Path:     "/",
							PathType: func() *netv1.PathType { t := netv1.PathTypePrefix; return &t }(),
							Backend: netv1.IngressBackend{
								Service: &netv1.IngressServiceBackend{Name: svc.Name, Port: netv1.ServiceBackendPort{Number: 80}},
							},
						}},
					},
				},
			}},
		},
	}
	if err := applyResource(ingress); err != nil {
		return ctrl.Result{}, err
	}

	// --- DB (Optional) ---
	if previewEnv.Spec.IncludeDB {
		dbLabels := map[string]string{"app": "gearpit-db", "instance": req.Name}
		dbDeploy := &appsv1.Deployment{
			TypeMeta: metav1.TypeMeta{Kind: "Deployment", APIVersion: "apps/v1"},
			ObjectMeta: metav1.ObjectMeta{Name: req.Name + "-db", Namespace: req.Namespace, Labels: dbLabels},
			Spec: appsv1.DeploymentSpec{
				Selector: &metav1.LabelSelector{MatchLabels: dbLabels},
				Template: corev1.PodTemplateSpec{
					ObjectMeta: metav1.ObjectMeta{Labels: dbLabels},
					Spec: corev1.PodSpec{
						Containers: []corev1.Container{{
							Name:  "postgres",
							Image: "postgres:15-alpine",
							Env: []corev1.EnvVar{
								{Name: "POSTGRES_USER", Value: "gearpit"},
								{Name: "POSTGRES_PASSWORD", Value: "gearpit"},
								{Name: "POSTGRES_DB", Value: "gearpit"},
							},
							Ports: []corev1.ContainerPort{{ContainerPort: 5432}},
						}},
					},
				},
			},
		}
		if err := applyResource(dbDeploy); err != nil {
			return ctrl.Result{}, err
		}
		
		dbSvc := &corev1.Service{
			TypeMeta: metav1.TypeMeta{Kind: "Service", APIVersion: "v1"},
			ObjectMeta: metav1.ObjectMeta{Name: req.Name + "-db", Namespace: req.Namespace, Labels: dbLabels},
			Spec: corev1.ServiceSpec{
				Selector: dbLabels,
				Ports:    []corev1.ServicePort{{Port: 5432, TargetPort: intstr.FromInt(5432)}},
			},
		}
		if err := applyResource(dbSvc); err != nil {
			return ctrl.Result{}, err
		}
	}

	// Status Update
	if previewEnv.Status.URL != host {
		previewEnv.Status.URL = host
		previewEnv.Status.Available = true
		if err := r.Status().Update(ctx, &previewEnv); err != nil {
			return ctrl.Result{}, err
		}
	}

	return ctrl.Result{}, nil
}

func (r *PreviewEnvReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&gearpitiov1alpha1.PreviewEnv{}).
		Owns(&appsv1.Deployment{}).
		Owns(&corev1.Service{}).
		Owns(&netv1.Ingress{}).
		Complete(r)
}