import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import {Card} from "react-bootstrap";

function About() {
  return (
    <div className="App">
      <header className="App-header">
          <Card className="p-3">
            <h1>On Lang is an innovative platform that streamlines the preparation process for academic and professional exams</h1>
          </Card>
      </header>
    </div>
  );
}
export default About;