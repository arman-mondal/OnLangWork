import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import React from "react";
import configData from "../../config.json";
import Loader from "react-js-loader";
import swal from "sweetalert";
import { Form, Card } from "react-bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default class CreateAssignment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reloadKey: Math.random(),
      show: true,
      courses: [],
      courseId: null,
      name: "",
      description: "",
      questions: [
        {
          question: "",
          ismultipechoice: false,
          mcqs: [
            {
              option: "",
              iswrite: false,
            },
            {
              option: "",
              iswrite: false,
            },
            {
              option: "",
              iswrite: false,
            },
            {
              option: "",
              iswrite: false,
            },
          ],
        },
      ],
    };
  }

  componentDidMount() {
    if (this.props.token) {
      window.location = configData.SERVER_URL;
    }
    const savedToken = localStorage.getItem("loginToken");
    this.getAssignmentPreLoad(savedToken);
    document.getElementById("loader").style.display = "none";
  }

  getAssignmentPreLoad(savedToken) {
    console.log(savedToken);
    axios({
      method: "get",
      url: configData.SERVER_URL + "assignment/getpreload",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        authtoken: savedToken,
      },
    })
      .then((resp) => {
        console.log(resp.data);
        if (resp.data.code === 200) {
          this.setState({
            courses: resp.data.courses,
            courseId: resp.data.courses[0].courseid,
          });
        } else {
          swal({
            title: "Server Not Responding",
            text: "Please reload the page",
            icon: "warning",
            button: "ok",
          });
        }
      })
      .catch((err) => {
        swal({
          title: "Server Not Responding",
          text: "Please reload the page",
          icon: "warning",
          button: "ok",
        });
      });
  }

  addnewQuestion = (e) => {
    e.preventDefault();
    this.setState({
      questions: [
        ...this.state.questions,
        {
          question: "",
          ismultipechoice: false,
          mcqs: [
            {
              option: "",
              iswrite: false,
            },
            {
              option: "",
              iswrite: false,
            },
            {
              option: "",
              iswrite: false,
            },
            {
              option: "",
              iswrite: false,
            },
          ],
        },
      ],
    });
  };

  createAssignment = (e) => {
    e.preventDefault();
    document.getElementById("loader").style.display = "block";
    const savedToken = localStorage.getItem("loginToken");
    var bodyFormData = new URLSearchParams();
    bodyFormData.append("course", this.state.courseId);
    bodyFormData.append("name", this.state.name);
    bodyFormData.append("description", this.state.description);
    bodyFormData.append("questions", JSON.stringify(this.state.questions));
    axios({
      method: "post",
      url: configData.SERVER_URL + "assignment/createassignment",
      data: bodyFormData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        authtoken: savedToken,
      },
    })
      .then((resp) => {
        console.log(resp.data);
        document.getElementById("loader").style.display = "none";
        if (resp.data.code === 200) {
          swal({
            title: "Assignment",
            text: "Assignment created successfully",
            icon: "success",
            button: "ok",
          }).then(function () {
            window.location.href = "/assignment";
          });
        } else {
          swal({
            title: "Server Error!",
            text: "Please try again!",
            icon: "warning",
            button: "ok",
          });
        }
      })
      .catch((err) => {
        document.getElementById("loader").style.display = "none";
        console.log(err);
        swal({
          title: "Server Error!",
          text: "Please try again!",
          icon: "warning",
          button: "ok",
        });
      });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div className="loader" id="loader">
            <Loader
              type="spinner-circle"
              bgColor={"#ffffff"}
              title={"LOADING..."}
              color={"#ffffff"}
              size={100}
            />
          </div>
          <section className="pricing" id="slotViewSection">
            <div className="container">
              <div className="col-lg-12 col-md-12 mt-6 mt-lg-0">
                <div className="box price featured no-padding">
                  <Card className="p-3">
                    <h3>Create Assigment</h3>
                    <Form>
                      <div
                        className="row d-flex align-items-center justify-content-center"
                        style={{ height: "25rem", overflowY: "scroll" }}
                      >
                        <div className="col-lg-6 col-md-6">
                          <Form.Group className="mb-3" controlId="name">
                            <Form.Label>
                              Name <span className="red">*</span>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Assignment Name"
                              onChange={(e) => {
                                this.state.name = e.currentTarget.value;
                                this.setState({
                                  name: this.state.name,
                                });
                              }}
                            />
                          </Form.Group>
                        </div>
                        <div className="col-lg-6 col-md-6">
                          <Form.Group className="mb-3" controlId="course">
                            <Form.Label>
                              Select course<span className="red">*</span>
                            </Form.Label>
                            <Form.Select
                              onChange={(e) => {
                                this.setState({
                                  courseId: e.currentTarget.value,
                                });
                              }}
                            >
                              {this.state.courses.map((course) => (
                                <option value={course.courseid}>
                                  {course.coursename}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </div>
                        <div className="col-lg-12 col-md-12">
                          <Form.Group className="mb-3" controlId="name">
                            <Form.Label>
                              Description <span className="red">*</span>
                            </Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              placeholder="Assignment Description"
                              onChange={(e) => {
                                this.state.description = e.currentTarget.value;
                                this.setState({
                                  description: this.state.description,
                                });
                              }}
                            />
                          </Form.Group>
                        </div>
                        <span key={this.state.reloadKey}>
                          {this.state.questions.map((question, index) => (
                            <>
                              <div className="col-lg-12 col-md-12">
                                <Form.Group
                                  className="mb-3"
                                  controlId="question"
                                >
                                  <Form.Label>
                                    Question No {index + 1}
                                    <span className="red">*</span>
                                  </Form.Label>
                                  <div>
                                    
                                    <CKEditor
                                      editor={ClassicEditor}
                                      data={question.question}
                                      config={{
                                        ckfinder: {
                                          uploadUrl: `${configData.SERVER_URL}uploadImage`,
                                        },
                                      }}
                                      onReady={(editor) => {
                                        // You can store the "editor" and use when it is needed.
                                        // console.log( 'Editor is ready to use!', editor );
                                      }}
                                      onChange={(event, editor) => {
                                        const data = editor.getData();
                                        question.question = data;
                                        this.setState(this.state.questions);
                                      }}
                                    />
                                    {question.question.trim() !== "" ? (
                                      <span
                                      className="text-danger"
                                      style={{display:"flex", padding:"10px"}}
                                        onClick={() => {
                                          let newArr = [
                                            ...this.state.questions,
                                          ];
                                          newArr[index] = {
                                            ...newArr[index],
                                            question: "",
                                          };
                                          this.setState({
                                            questions: [...newArr],
                                            reloadKey: Math.random(),
                                          });
                                        }}
                                        // className="fa fa-window-close"
                                      >
                                        Remove
                                      </span>
                                    ) : null}
                                  </div>
                                </Form.Group>
                              </div>
                              <div className="col-lg-2 col-md-2">
                                <Form.Group className="mb-3" controlId="mcqs">
                                  <Form.Label>
                                    Create a MCQ <span className="red">*</span>
                                  </Form.Label>
                                  <Form.Check
                                    type="switch"
                                    id="custom-switch"
                                    onChange={(e) => {
                                      question.ismultipechoice =
                                        !question.ismultipechoice;
                                      this.setState(this.state.questions);
                                    }}
                                  />
                                </Form.Group>
                              </div>
                              <div className="row d-flex align-items-center justify-content-center">
                                {question.ismultipechoice ? (
                                  <>
                                    {question.mcqs.map((mcq, index) => (
                                      <>
                                        <div className="col-lg-4 col-md-4 mt-6 mt-lg-0">
                                          <Form.Group
                                            className="mb-3"
                                            controlId="mcqsOption"
                                          >
                                            <Form.Label>
                                              Option {index + 1}{" "}
                                              <span className="red">*</span>
                                            </Form.Label>
                                            <Form.Control
                                              type="text"
                                              placeholder="Enter your answer"
                                              onChange={(e) => {
                                                mcq.option =
                                                  e.currentTarget.value;
                                                this.setState(
                                                  this.state.questions
                                                );
                                              }}
                                            />
                                          </Form.Group>
                                        </div>
                                        <div className="col-lg-2 col-md-2 mt-6 mt-lg-0">
                                          <Form.Group
                                            className="mb-3"
                                            controlId="answer"
                                          >
                                            <Form.Label>
                                              True Answer{" "}
                                              <span className="red">*</span>
                                            </Form.Label>
                                            <Form.Check
                                              type="switch"
                                              id="custom-switch"
                                              onChange={(e) => {
                                                mcq.iswrite = !mcq.iswrite;
                                                this.setState(
                                                  this.state.questions
                                                );
                                              }}
                                            />
                                          </Form.Group>
                                        </div>
                                      </>
                                    ))}
                                  </>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </>
                          ))}
                        </span>
                      </div>
                      <div className="btn-wrap-next">
                        <form action="/createagenda">
                          <button
                            type="submit"
                            className="btn-buy button-Next"
                            onClick={this.addnewQuestion}
                          >
                            Add New Question
                          </button>
                          <button
                            type="submit"
                            className="btn-buy button-Next"
                            onClick={this.createAssignment}
                          >
                            Create Assigment
                          </button>
                        </form>
                      </div>
                    </Form>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </header>
      </div>
    );
  }
}
