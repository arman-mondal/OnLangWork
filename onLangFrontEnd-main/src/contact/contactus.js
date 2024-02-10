import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import {Card} from "react-bootstrap";

function Contact() {
  return (
    <div className="App">
      <header className="App-header">
          <Card className="p-3">
            <h1>Contact us at info@onlang.net</h1>
          </Card>
      </header>
    </div>
  );
}
export default Contact;