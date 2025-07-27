# Celtra Frontend Developer Task

### ✨ Live Demo

*You can access the live page via this link:* **https://mhorvat-celtra-exam.netlify.app/**

---

### ✅ Features (required and additional)

*   **Responsive Design:** The layout is fully responsive and optimized for a great experience on both mobile and desktop screens.
*   **Dark Mode:** A fully functional light/dark theme toggle, with the users preference saved to persistent storage.
*   **Image Gallery:** Browse the gallery of images from the Picsum API.
    *   **Desktop Pagination:** On desktop devices, the gallery is paginated with 20 images per page, complete with navigation controls and intelligent page prefetching on hover. It is also properly handling "end of the list" meaning user should not encounter any edge case scenarios by "escaping" the last page - even if that one is not defined by the API.
    *   **Mobile Infinite Scroll:** On touch devices, the gallery seamlessly uses an infinite scroll mechanism for a native-app feel. The pages prefetch in a way that should enable the user uninterrupted browsing - just like social media apps do it.
    *   **Visible Page Information:** App shows which images are visible to user (for example if images 4,5,6 are visible out of 120 loaded images on that page it will show: 4-6 of 120) -- that number will dynamically change based off what users sees and what is available at that moment - works on both mobile and desktop view.
*   **Image Detail View:** Click on any image to navigate to a detailed view showing the full resolution image, author, and dimensions (the initial shown data is the one from gallery meaning the app will have faster load times, while the detailed image info is fetching -- especially useful if that detailed image fetch ever gets new parameters in response).
    *   **Seamless Navigation:** The detail view allows for easy navigation to the next and previous images in the gallery sequence (works in both directions indefinetly, the prefetching of previous and next pages also works so the load times are always fast - while the detailed page fetches happen in real time).
    *   **Automatic Scroll Restoration:** When returning back from the detailed view, the app takes the latest photo into account and automatically scrolls to it (works both on mobile view, and on desktop view -- even if the photo is on different page).
*   **Downloading The Images:** Each image can be downloaded directly from the gallery or from detailed view.
*   **State Persistence:** The application remembers which images you have viewed. It is using persistent storage to remember "SEEN" items even after refreshing the page, just like the dark mode setting.
    *   **"SEEN" Indicators:** Previously viewed images are marked with a "SEEN" badge.
    *   **"LATEST SEEN" Indicator:** The most recently viewed image is highlighted with a special badge "LATEST SEEN".
*   **Editable constants File:** Cache TTL, Items per page (for both mobile and desktop), prefetch offsets and triggers, visibility counter sensitivity can all be changed via the constants.ts file.
*   **Scalable Project Structure:** The codebase is organized using a feature based structure. This keeps related components and views co located, making the application easier to scale and maintain.
*   **Used Git Workflow:** All development followed a feature branch workflow. Each new feature or fix was built on a dedicated branch. Changes were then merged into the main branch via pull requests to ensure a clean and stable history. 

---

### 🛠️ Tech Stack

This project was built using the recommended tech stack:

*   **Framework:** [Vue.js 3](https://vuejs.org/) (Composition API with `<script setup>`)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **State Management:** [Pinia](https://pinia.vuejs.org/) (using Setup Stores)
*   **Routing:** [Vue Router](https://router.vuejs.org/)
*   **Styling:** [SCSS (Sass)](https://sass-lang.com/)
*   **Testing:** [Vitest](https://vitest.dev/) for unit and component testing, along with [Vue Test Utils](https://test-utils.vuejs.org/).
*   **Build Tooling:** [Vite](https://vitejs.dev/)

---

### 🚀 Local Development

Follow these instructions to get the project running on your local machine.

#### Prerequisites

*   [Node.js](https://nodejs.org/) (version 22.x or later recommended)
*   [npm](https://www.npmjs.com/) (comes with Node.js)

#### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mihahorvat5/Celtra-Exam
    ```
2.  **Navigate into the project directory:**
    ```bash
    cd .\Celtra-Exam\
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```

#### Running the Development Server

To run the application in development mode with hot-reloading:

```bash
npm run dev
```
The application will be available at `http://localhost:5173` (or the next available port).

---

### 🐳 Docker (Bonus)

The application is fully containerized for easy deployment.

#### Prerequisites

*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) must be installed and running.

#### Build and Run the Container

1.  **Navigate into the project directory:**
    ```bash
    cd .\Celtra-Exam\
    ```
2.  **Build the Docker image:**
    ```bash
    docker build -t celtra-exam-app .
    ```
3.  **Run the container:**
    ```bash
    docker run -d -p 8080:80 --name celtra-exam-container celtra-exam-app
    ```

The production-ready application will be available at **`http://localhost:8080`**.

---

### 🧪 Running Tests

The project includes many tests.

1.  **Navigate into the project directory:**
    ```bash
    cd .\Celtra-Exam\
    ```
2.   **Run all tests once:**
    ```bash
    npm run test:unit
    ```

---