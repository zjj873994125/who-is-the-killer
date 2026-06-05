# Docker + Nginx 部署说明

本项目是纯静态 Vite 前端。生产环境使用多阶段 Docker 镜像：

1. `node:22-alpine` 安装依赖并执行 `npm run build`。
2. `nginx:1.27-alpine` 托管构建产物 `dist/`。
3. GitHub Actions 将镜像推送到 GitHub Container Registry。
4. 服务器通过 Docker Compose 拉取镜像并运行容器。

## 服务器要求

服务器只需要安装：

- Docker
- Docker Compose v2

不需要在宿主机单独安装 Nginx。Nginx 已经内置在应用镜像中。

## GitHub Secrets

在 GitHub 仓库的 `Settings -> Secrets and variables -> Actions` 中添加：

| Secret | 必填 | 示例 | 说明 |
| --- | --- | --- | --- |
| `SERVER_HOST` | 是 | `1.2.3.4` | 服务器 IP 或域名 |
| `SERVER_USER` | 是 | `root` | SSH 用户 |
| `SERVER_PORT` | 否 | `22` | SSH 端口，不填默认 22 |
| `SERVER_SSH_KEY` | 是 | 私钥内容 | 用于登录服务器的 SSH 私钥 |
| `DEPLOY_PATH` | 是 | `/opt/haunted-elevator` | 服务器部署目录 |
| `APP_PORT` | 否 | `38080` | 宿主机暴露端口，不填默认 38080 |
| `CONTAINER_NAME` | 否 | `haunted-elevator` | 容器名 |
| `GHCR_USERNAME` | 私有镜像必填 | GitHub 用户名 | 服务器拉取私有 GHCR 镜像时使用 |
| `GHCR_TOKEN` | 私有镜像必填 | PAT | 需要 `read:packages` 权限 |

如果 GHCR 镜像设置为 Public，可以不配置 `GHCR_USERNAME` 和 `GHCR_TOKEN`。

## 部署流程

推送到 `main` 分支或手动执行 `Deploy` workflow 后，GitHub Actions 会：

1. 安装依赖：`npm ci`
2. 运行测试：`npm test`
3. 构建前端：`npm run build`
4. 构建 Docker 镜像并推送到 `ghcr.io/<owner>/<repo>`
5. SSH 到服务器，上传 `deploy/docker-compose.yml`
6. 在服务器执行：

```bash
docker compose pull
docker compose up -d
docker image prune -f
```

## 本地验证 Docker 镜像

```bash
docker build -t haunted-elevator-demo .
docker run --rm -p 8080:80 haunted-elevator-demo
```

访问：

```text
http://127.0.0.1:8080/
```

## 服务器目录结构

部署后服务器目录类似：

```text
/opt/haunted-elevator/
  .env
  docker-compose.yml
```

`.env` 由 GitHub Actions 自动生成，不需要提交到仓库。

## 域名和 HTTPS

当前容器直接暴露 HTTP 端口。默认宿主机端口是 `38080`，访问地址类似 `http://服务器IP:38080/`。如果要改端口，可以在 GitHub Secrets 中设置 `APP_PORT`。

如果后续需要 HTTPS 或同一台服务器部署多个应用，建议在容器外层增加统一反向代理，例如 Caddy、Traefik、Nginx Proxy Manager 或宿主机 Nginx。
