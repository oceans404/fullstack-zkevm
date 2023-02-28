import { useState } from "react";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  const incrementCounter = () => {
    // we should read currentCount from the blockchain
    const currentCount = count;
    setCount(currentCount + 1);
  };

  return (
    <Container maxWidth="sm">
      <Card sx={{ minWidth: 275, marginTop: 20 }}>
        <CardContent>
          <p>Count: {count}</p>
          <Button onClick={incrementCounter} variant="outlined">
            +1
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}

export default App;
