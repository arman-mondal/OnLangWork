import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import {Card} from "react-bootstrap";


function Home() {
  return (
    <div className="App">
      <header className="App-header">
          <Card className="p-3">
            <h1>Welcome</h1>
          </Card>
      </header>
    </div>
  );
}
export default Home;