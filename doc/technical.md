# Technical

## 1. 技术栈

- 游戏：Ink of Fate
- 类型：social
- 简述：An old biker tattoo artist takes one look and inks the tattoo you were always going to get — Sailor Jerry, irezumi, blackwork. Answer one question; he reads its meaning back. AlterU After Dark.
- 框架 / 语言 / 构建：React, TypeScript, Vite, Less
- 渲染方式：Canvas/WebGL
- 依赖摘录：@types/react@^18.2.0, @types/react-dom@^18.2.0, @vitejs/plugin-react@^4.2.1, less@^4.2.0, react@^18.2.0, react-dom@^18.2.0, typescript@^5.3.3, vite@^5.1.0
- 平台元信息：meta.title=Ink of Fate；cover_url=/poster.png；category=social；uuid=4f8329f2-0988-4e86-861e-f464deddc1c0
- 生成媒体：纹身结果通过 AlterU Media Service 的单参考 edit 模式生成，永久游戏 UUID 作为 session_id，固定输出 512×512 PNG；命运解读仍使用 Aigram game-chat。

## 2. 目录结构

- `index.html`：Vite/浏览器入口，挂载根节点和基础 meta。
- `package.json`：定义 npm 脚本、依赖和工程名称。
- `vite.config.ts`：配置构建、插件和相对路径 base。
- `meta.json`：平台发布元信息，包含标题和封面。
- `src/App.tsx`：React 组件和交互界面。
- `src/main.tsx`：React 组件和交互界面。
- `src/index.less`：视觉样式、布局、动画和响应式规则。
- `src/vite-env.d.ts`：游戏源码模块。
- `src/game-id.ts`：游戏源码模块。
- `src/shared/runtime/useGameStats.ts`：游戏源码模块。
- `src/shared/runtime/useUpload.ts`：游戏源码模块。
- `src/shared/runtime/useChat.ts`：游戏源码模块。
- `src/shared/runtime/useGenImage.ts`：游戏源码模块。
- `src/shared/runtime/media.ts`：统一媒体任务、尺寸拟合、结构化错误、轮询和幂等请求客户端。
- `src/shared/runtime/bridge.ts`：游戏源码模块。
- `src/shared/runtime/game-id.ts`：游戏源码模块。
- `src/shared/runtime/useGameEvent.ts`：游戏源码模块。
- `src/shared/runtime/index.ts`：游戏源码模块。
- `src/shared/social/guestbook.ts`：游戏源码模块。

关键源码模块：

- `src/App.tsx`
- `src/main.tsx`
- `src/index.less`
- `src/vite-env.d.ts`
- `src/game-id.ts`
- `src/shared/runtime/useGameStats.ts`
- `src/shared/runtime/useUpload.ts`
- `src/shared/runtime/useChat.ts`
- `src/shared/runtime/useGenImage.ts`
- `src/shared/runtime/bridge.ts`
- `src/shared/runtime/game-id.ts`
- `src/shared/runtime/useGameEvent.ts`
- `src/shared/runtime/index.ts`
- `src/shared/social/guestbook.ts`
- `src/shared/social/useGuestbook.ts`
- `src/shared/save/useGameSave.ts`
- `src/shared/save/index.ts`
- `src/InkOfFate/InkOfFate.less`
- `src/InkOfFate/types.ts`
- `src/InkOfFate/index.ts`
- `src/InkOfFate/InkOfFate.tsx`
- `src/InkOfFate/utils/audio.ts`
- `src/InkOfFate/utils/prompts.ts`
- `src/InkOfFate/utils/booking.ts`

## 3. 核心模块

- 状态管理与节奏：通过 React 状态与定时器处理倒计时、阶段推进或生成节奏。
- 渲染方式：Canvas/WebGL，样式由 CSS/Less 和组件结构共同完成。
- 碰撞 / 更新：源码包含命中、距离、边界或重叠判断，结果会影响得分、生命或阶段。
- 音频：包含程序化音频或音频文件播放，按交互事件触发。
- 多语言：包含 i18n / locale 检测或 `t()` 文案函数。
- 存储：使用 localStorage、useGameSave 或 persist 保存分数、收藏、墙数据或本地状态。
- Aigram 运行时：接入 `@shared/runtime` 或平台桥接能力，用于用户、资料页、分享、通知或平台 API。
- AI / 生成接口：`useFateGen.ts` 上传或读取玩家公网头像，先生成结构化解读，再调用单参考 edit。每次主动生成创建一个 request_id；网络结果不明时复用该 ID，结构化可重试失败则等待服务端建议时长并创建新 ID。提示词把完整身份与原构图置于纹身设计之前。
- 社交墙 / 归档：包含 wall、gallery、feed 或 archive 数据流与浏览界面。

## 4. 扩展点

- 改玩法参数：优先查找 `src/` 内大写常量、hooks、主组件顶部配置或关卡数组。
- 换素材：替换 `public/`、`src/img/` 或源码 import 的图片/音频文件，并保持相对路径。
- 调视觉：修改主样式文件中的颜色、间距、动画时长、网格尺寸和响应式规则。
- 改文案：修改 i18n 字典、组件内标题按钮文案，保持 zh/en 同步。
- 加平台能力：在已有 `@shared/runtime`、useGameSave、排行榜、墙或通知调用附近扩展，避免另起一套存储。
- 改媒体画幅、重试或错误策略：编辑 `src/shared/runtime/useGenImage.ts`；公共协议只在 `src/shared/runtime/media.ts` 扩展。
- 改纹身编辑合同：编辑 `src/InkOfFate/utils/prompts.ts`；唯一允许的新元素应继续是已有可见表面上的纹身。
