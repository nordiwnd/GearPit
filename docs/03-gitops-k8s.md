# 03. GitOps & Kubernetes Guidelines

## 1. Target Environment
- **Cluster**: k3s on Raspberry Pi (ARM64)
- **Operator**: ArgoCD

## 2. Manifest Structure (Kustomize)
マニフェストは `manifests/` 配下に集約する。Kustomizeを利用して環境差分を吸収する。

- `base/`: すべての環境で共通の定義（Deployment, Service, Ingressなど）。
- `overlays/main/`: 本番環境（mainブランチ）向けの設定（ドメイン、リソース制限など）。
- `overlays/preview/`: PRプレビュー環境向けの設定（エフェメラルDBなど）。

## 3. Deployment Flow
1. GitHub Actionsが `linux/arm64` イメージをビルドし、GHCRへPush。
2. ActionsがKustomizeのイメージタグを最新のコミットハッシュに書き換え、リポジトリへCommit & Push。
3. ArgoCDが変更を検知し、k3sクラスターへ自動Sync。

## 4. Constraint
- マニフェスト内に直接Secret（平文）を書かない。ExternalSecretsやSealedSecretsの導入を検討（現在は`ops/`配下で管理）。