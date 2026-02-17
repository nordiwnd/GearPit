load('ext://restart_process', 'docker_build_with_restart')
allow_k8s_contexts(['k3d-gearpit-dev'])
default_registry(
'localhost:5001',
host_from_cluster='k3d-gearpit-registry:5000'
)
# 1. Database
# Note: The local-dev overlay relies on the base postgres definition.
# Defining a resource here allows for port-forwarding visibility in Tilt.
k8s_resource('gearpit-db', 
port_forwards='5432:5432',
labels=['database']
)

# 2. Backend (gearpit-core)
core_yaml = kustomize('manifests/apps/gearpit-core/overlays/local-dev')
k8s_yaml(core_yaml)

docker_build_with_restart(
'gearpit-app',
context='.',
dockerfile_contents='''
FROM golang:1.25.6-alpine
RUN apk add --no-cache git tar
WORKDIR /app
COPY apps/gearpit-core/go.mod .
COPY apps/gearpit-core/go.sum .
RUN go mod download
COPY apps/gearpit-core/ .
RUN go build -o /app/main ./main.go
ENTRYPOINT ["/app/main"]
''',
entrypoint='/app/main',
platform='linux/amd64',
live_update=[
sync('apps/gearpit-core', '/app'),
run('cd /app && go build -o /app/main ./main.go', trigger=['apps/gearpit-core']),
],
)

k8s_resource('gearpit-app', 
new_name='gearpit-core',
resource_deps=['gearpit-db'], # Wait for DB
labels=['backend'],
)

# 3. Frontend (gearpit-web)
web_yaml = kustomize('manifests/apps/gearpit-web/overlays/local-dev')
k8s_yaml(web_yaml)

docker_build(
'gearpit-web',
context='.',
dockerfile_contents='''
FROM node:22-alpine
WORKDIR /app
COPY apps/gearpit-web/package.json .
COPY apps/gearpit-web/package-lock.json .
RUN npm install
COPY apps/gearpit-web/ .
CMD ["npm", "run", "dev"]
''',
platform='linux/amd64',
live_update=[
sync('apps/gearpit-web', '/app'),
run('cd /app && npm install', trigger='apps/gearpit-web/package.json'),
]
)

k8s_resource('gearpit-web', 
port_forwards=['9000:3000'],
labels=['frontend']
)