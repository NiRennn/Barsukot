import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import "./App.scss";
import appRoutes from "./routes/routes";
import Loading from "./components/Loading/Loading";
import StoryPage from "./components/StoryPage/StoryPage";

function App() {
  return (
    <div className="app-wrapper">
      <div className="app-container">
        <Provider store={store}>
          <BrowserRouter>
            <Routes>
              <Route path={appRoutes.LOADING} element={<Loading />} />
              <Route path={appRoutes.STORY} element={<StoryPage />} />
            </Routes>
          </BrowserRouter>
        </Provider>
      </div>
    </div>
  );
}

export default App;
