package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// PreviewEnvSpec defines the desired state of PreviewEnv
type PreviewEnvSpec struct {
	// PRNumber is the pull request number.
	// +kubebuilder:validation:Required
	// +kubebuilder:validation:Minimum=1
	PRNumber int `json:"prNumber"`

	// ImageTag is the container image tag to deploy.
	// +kubebuilder:validation:Required
	// +kubebuilder:validation:MinLength=1
	ImageTag string `json:"imageTag"`

	// IncludeDB determines whether to provision a dedicated database.
	// +kubebuilder:default=true
	// +optional
	IncludeDB bool `json:"includeDB,omitempty"`
}

// PreviewEnvStatus defines the observed state of PreviewEnv
type PreviewEnvStatus struct {
	// URL is the generated access point.
	// +optional
	URL string `json:"url,omitempty"`

	// Available indicates if the deployment is ready.
	// +optional
	Available bool `json:"available"`
}

// +kubebuilder:object:root=true
// +kubebuilder:subresource:status
// +kubebuilder:printcolumn:name="PR",type="integer",JSONPath=".spec.prNumber"
// +kubebuilder:printcolumn:name="URL",type="string",JSONPath=".status.url"
// +kubebuilder:printcolumn:name="Available",type="boolean",JSONPath=".status.available"
// +kubebuilder:printcolumn:name="Age",type="date",JSONPath=".metadata.creationTimestamp"

// PreviewEnv is the Schema for the previewenvs API
type PreviewEnv struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   PreviewEnvSpec   `json:"spec,omitempty"`
	Status PreviewEnvStatus `json:"status,omitempty"`
}

// +kubebuilder:object:root=true

// PreviewEnvList contains a list of PreviewEnv
type PreviewEnvList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []PreviewEnv `json:"items"`
}

func init() {
	SchemeBuilder.Register(&PreviewEnv{}, &PreviewEnvList{})
}