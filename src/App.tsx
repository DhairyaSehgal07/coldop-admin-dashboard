import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Container from "./components/Container";
const App = () => {
  return (
    <>
      <Navbar />
      <Container>
        <Outlet />
      </Container>
    </>
  );
};

export default App;
