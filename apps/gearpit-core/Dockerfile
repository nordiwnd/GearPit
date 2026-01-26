# syntax=docker/dockerfile:1

# 1. Build Stage
# --platform=$BUILDPLATFORM を指定することで、常にホスト(GitHub Actionsならamd64)のネイティブ速度でGoが動きます
FROM --platform=$BUILDPLATFORM golang:1.25 AS builder

WORKDIR /app

# 依存関係のダウンロード
COPY go.mod go.sum ./
RUN go mod download

# ソースコードのコピー
COPY . .

# 2. Cross Compilation
# 自動注入される ARG: TARGETOS, TARGETARCH を使ってクロスコンパイル
# CGO_ENABLED=0 により、純粋なGoバイナリとしてビルド（Alpine/Distrolessで動作可能）
ARG TARGETOS
ARG TARGETARCH
RUN --mount=type=cache,target=/go/pkg/mod/ \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -ldflags="-w -s" -o server main.go

# 3. Production Stage
# 実行用イメージは超軽量な Distroless を使用
FROM gcr.io/distroless/static:nonroot

WORKDIR /
COPY --from=builder /app/server .

# ポート公開（ドキュメント用）
EXPOSE 8080

USER 65532:65532
ENTRYPOINT ["/server"]