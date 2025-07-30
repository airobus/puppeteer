# Puppeteer 项目

这是一个使用 Puppeteer 的 Node.js 项目，用于根据 HTML 模板生成截图。

## 功能

- 读取 `html/` 目录下的所有 HTML 文件。
- 使用 `template.html` 作为模板。
- 为每个 HTML 文件动态生成内容并输出截图到 `output_cards/` 目录。

## 安装

在开始之前，请确保你已经安装了 [Node.js](https://nodejs.org/)。

然后，在项目根目录下运行以下命令来安装项目依赖：

```bash
npm install
```

## 使用方法

安装完依赖后，运行以下命令来生成截图：

```bash
node generate.js
```

脚本会自动处理 `html/` 目录下的所有 HTML 文件，并将生成的截图保存在 `output_cards/` 目录下。

## 文件结构说明

- **`generate.js`**: 项目的主脚本，负责读取 HTML 文件、使用 Puppeteer 创建浏览器实例、生成截图等核心逻辑。
- **`template.html`**: 用于生成截图的基础 HTML 模板。
- **`html/`**: 存放需要被处理的原始 HTML 文件的目录。
- **`output_cards/`**: 存放由 `generate.js` 生成的最终截图文件的目录。
- **`package.json`**: 项目配置文件，包含了项目依赖等信息。
