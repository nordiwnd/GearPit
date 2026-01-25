# Build Stage
# --platform=$BUILDPLATFORM を追加することで、
# ターゲットがARM64であっても、ビルドにはランナーのネイティブ(AMD64)なGoイメージを使用
FROM --platform=$BUILDPLATFORM golang:1.25 as builder

WORKDIR /app
COPY go.mod ./
# COPY go.sum ./
# RUN go mod download

COPY . .

ARG TARGETOS
ARG TARGETARCH
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o gearpit-app .

# Production Stage
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /
COPY --from=builder /app/gearpit-app .
USER 65532:65532

ENTRYPOINT ["/gearpit-app"]