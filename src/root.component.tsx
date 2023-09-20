import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store/store";

export default function Root(props) {
  return (
    <Provider store={store}>
    <section data-testid="main-container">
      <App />
    </section>
    </Provider>
  );
}
