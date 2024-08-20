# Audio Recorder App

This is a React Native application built with Expo that allows users to record audio, pause/resume recordings, and play back the recorded audio. The app uses Expo's Audio API to handle recording and playback functionalities and is designed with user-friendly UI components.

## Project Overview

The Audio Recorder App allows users to:
- Start, pause, resume, and stop audio recordings
- Play, pause, resume, and stop playback of recorded audio
- Visually indicate the recording status
- Display the recording duration

## Tech Stack

| Technology            | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| React Native          | Framework for building native apps using React.                             |
| Expo                  | A platform for building and deploying universal React applications across Android, iOS, and web. Expo simplifies the development process by providing a managed workflow with a suite of tools and services. It includes pre-configured native APIs, over-the-air updates, and an integrated development environment that allows for fast iterations and debugging.  |
| TypeScript            | Superset of JavaScript that adds static types.                              |
| Jest                  | JavaScript testing framework for unit tests.                                |
| ESLint                | Identifying and reporting on patterns in JavaScript/TypeScript.  |
| Prettier              | An opinionated code formatter.                                              |


## Installation

To get started with the Audio Recorder App, follow the steps below:

1. Clone the repository:
   ```bash
   git clone https://github.com/midori-profile/audio-recorder-react-native.git
   ```

2. Navigate to the project directory:
   ```bash
   cd audio-recorder-react-native
   ```

3. Install the dependencies using Yarn:
   ```bash
   yarn install
   ```

## Running the Application

To start the application, run the following command:

```bash
yarn start
```

This command will start the Expo development server. You can then run the app on your Android or iOS device using the Expo Go app, or on an emulator.


## Running Tests

To run the unit tests using Jest, run the following command:

```bash
yarn test
```

## Running Lints

To lint the codebase using ESLint, run the following command:

```bash
yarn lint
```


## Project Structure

The project's structure is organized as follows:

```
audio-recorder-react-native/
│
├── src/
│   ├── components/      # UI components
│   ├── hooks/           # Custom hooks
│   ├── screens/         # App screens
│   ├── services/        # Services for handling business logic
│   ├── utils/           # Utility functions
│   └── App.tsx          # Entry point of the application
│
├── __tests__/           # Unit tests
│
├── assets/              # Static assets like images and fonts
│
├── jest.config.js       # Jest configuration
├── .eslintrc.js         # ESLint configuration
├── .prettierrc          # Prettier configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Project dependencies and scripts
└── README.md            # Project documentation
```

## Additional Notes

- The app requests microphone permissions before recording audio.
- Error handling is implemented for all recording and playback operations.
- Basic styling is applied to ensure a clean, user-friendly interface.
```

---

### 功能文档

```markdown
# 功能文档 - Audio Recorder App

下表列出了 Audio Recorder App 的功能实现情况：

| 功能描述                                | 是否实现 | 备注                                                           |
|-----------------------------------------|----------|----------------------------------------------------------------|
| 开始录音                                | 是       | 使用了 Expo 的 Audio API                                       |
| 暂停录音                                | 是       | 可以在录音过程中暂停并恢复录音                                 |
| 继续录音                                | 是       | 暂停后可以继续录音                                             |
| 停止录音                                | 是       | 停止录音后可以保存音频文件                                     |
| 播放录音                                | 是       | 支持播放已录制的音频                                           |
| 暂停播放                                | 是       | 可以在播放过程中暂停并恢复播放                                 |
| 继续播放                                | 是       | 暂停后可以继续播放                                             |
| 停止播放                                | 是       | 停止播放并重置进度                                             |
| 录音状态指示                            | 是       | 录音时显示状态指示                                             |
| 录音时长显示                            | 是       | 显示录音的时长                                                 |
| 保存多段录音                            | 否       | 基本功能实现，尚未实现多段录音保存                              |
| 显示已保存录音列表                      | 否       | 基本功能实现，尚未实现录音列表显示                              |
| 删除已保存录音                          | 否       | 基本功能实现，尚未实现删除录音功能                              |
| 错误处理和权限请求                      | 是       | 处理了录音权限请求及相关错误                                   |
| 基本样式                                | 是       | 实现了基本的用户界面样式设计                                   |
```

通过上述文档，你可以轻松了解项目的功能实现情况，并根据需要进行后续开发和优化。