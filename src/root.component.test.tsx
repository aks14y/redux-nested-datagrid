import { render } from "@testing-library/react";
import Root from "./root.component";

describe("Root component", () => {
  it("should be in the document", () => {
    const { getByTestId } = render(<Root name="Testapp" />);
    expect(getByTestId("main-container")).toBeInTheDocument();
  });
});
