# 変更点1: --platform=$BUILDPLATFORM を追加
# これにより、ビルド処理自体はホストのアーキテクチャ(amd64)で高速に実行されます
FROM --platform=$BUILDPLATFORM golang:1.24 AS builder

ARG TARGETOS
ARG TARGETARCH

WORKDIR /workspace

# 依存関係のダウンロード (変更頻度が低いので先にやる)
COPY go.mod go.mod
COPY go.sum go.sum

# 変更点2: キャッシュマウントを追加
# go mod download の結果をキャッシュ
RUN --mount=type=cache,target=/go/pkg/mod/ \
    go mod download

# ソースコードのコピー
COPY cmd/ cmd/
COPY api/ api/
COPY internal/ internal/

# Build
# 変更点3: ビルドキャッシュとモジュールキャッシュをマウント
# これにより、変更されていないパッケージの再コンパイルを防ぎます
RUN --mount=type=cache,target=/go/pkg/mod/ \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH} go build -a -o manager cmd/main.go

# 実行用イメージ (ここはターゲットアーキテクチャが必要なので platform 指定はしない)
FROM gcr.io/distroless/static:nonroot
WORKDIR /
COPY --from=builder /workspace/manager .
USER 65532:65532

ENTRYPOINT ["/manager"]