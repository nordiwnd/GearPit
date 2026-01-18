# Build Stage
FROM golang:1.25-bullseye as builder

WORKDIR /app
COPY go.mod ./
# go.sumはまだないのでコメントアウトのまま
# COPY go.sum ./
# RUN go mod download

COPY . .
# ビルド設定: CGO無効化、OS/ArchはBuildxが自動注入する変数を利用
ARG TARGETOS
ARG TARGETARCH
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o gearpit-app .

# Production Stage (Distroless)
# 軽量かつセキュアな実行用イメージ
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /
COPY --from=builder /app/gearpit-app .
USER 65532:65532

ENTRYPOINT ["/gearpit-app"]