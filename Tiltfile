allow_k8s_contexts('k3d-gearpit-dev')

# Build Backend
docker_build('gearpit-core', '.',
    dockerfile='apps/gearpit-core/Dockerfile',
    live_update=[
        sync('apps/gearpit-core/src', '/app/src'),
        # Trigger rebuild on Cargo.toml change?
        # For now, just syncing src is enough for cargo-watch
    ]
)

# Build Frontend
docker_build('gearpit-web', '.',
    dockerfile='apps/gearpit-web/Dockerfile',
    live_update=[
        sync('apps/gearpit-web/app', '/app/apps/gearpit-web/app'),
        sync('apps/gearpit-web/public', '/app/apps/gearpit-web/public'),
    ]
)

# Deploy Manifests
k8s_yaml('infra/dev/all.yaml')

# Port Forwards
k8s_resource('gearpit-web', port_forwards='9000:80')
k8s_resource('gearpit-core', port_forwards='3000:3000')
k8s_resource('postgres', port_forwards='5432:5432')
