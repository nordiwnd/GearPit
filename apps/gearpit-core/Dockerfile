# syntax=docker/dockerfile:1

# 1. Build Stage
FROM --platform=$BUILDPLATFORM golang:1.25 AS builder

WORKDIR /app

# 依存関係のダウンロード
COPY go.mod go.sum ./

# これがないと、次のステップのマウントによってダウンロード済みファイルが隠蔽され、再DLが発生します
RUN --mount=type=cache,target=/go/pkg/mod/ \
    go mod download

# ソースコードのコピー
COPY . .

# 2. Cross Compilation
ARG TARGETOS
ARG TARGETARCH

# ビルド実行
# ここでもマウントを使うことで、ビルド済みオブジェクトを再利用します
RUN --mount=type=cache,target=/go/pkg/mod/ \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -ldflags="-w -s" -o server main.go

# 3. Production Stage
FROM gcr.io/distroless/static:nonroot

WORKDIR /
COPY --from=builder /app/server .

EXPOSE 8080

USER 65532:65532
ENTRYPOINT ["/server"]