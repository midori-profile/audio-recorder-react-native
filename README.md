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
