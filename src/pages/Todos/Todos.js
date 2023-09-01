import React, { useEffect, useState } from 'react'
import { Tooltip, Button, Card, Divider, Space, Typography, message } from 'antd';
import { DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore'
import { firestore } from '../../config/firebase'
import { useAuthContext, useCalDataContext, useSelectDataContext, useSearchTodoContext } from '../../contexts/AuthContext'

const { Title } = Typography;
const { Meta } = Card;

export default function Todos() {
  const navigate = useNavigate();
  const { selectedData } = useSelectDataContext();
  const { calData } = useCalDataContext();
  const { searchTodo } = useSearchTodoContext();

  const { user } = useAuthContext()
  const [allDocuments, setAllDocuments] = useState([])
  const [documents, setDocuments] = useState([])

  const getTodos = async (selectedData) => {
    // const q = query(collection(firestore, "todos"), where("createdBy.uid", "==", user.uid));

    const currentDate = dayjs().format('YYYY-MM-DD');
    let q;
    console.log("allDocuments", allDocuments,"user", user)

    switch (selectedData) {
      case 'Upcoming':
        q = query(collection(firestore, "todos"), where("createdBy.uid", "==", user.uid), where("date", ">", currentDate));
        break;
      case 'Today':
        q = query(collection(firestore, "todos"), where("createdBy.uid", "==", user.uid), where("date", "==", currentDate));
        break;
      case 'subCalendar':
        q = query(collection(firestore, "todos"), where("createdBy.uid", "==", user.uid), where("date", "==", calData));
        break;
      case 'Todos':
        q = query(collection(firestore, "todos"), where("createdBy.uid", "==", user.uid));
        break;
      case 'Peronal':
        q = query(collection(firestore, "todos"), where("tag", "==", "personal"), where("createdBy.uid", "==", user.uid));
        break;
      case 'Work':
        q = query(collection(firestore, "todos"), where("tag", "==", "work"), where("createdBy.uid", "==", user.uid));
        break;
      default:
        q = query(collection(firestore, "todos"), where("createdBy.uid", "==", user.uid));
        break;
    }


    const querySnapshot = await getDocs(q);
    const array = querySnapshot.docs.map((doc) => doc.data());
    setAllDocuments(array);
    setDocuments(array);
  }

  const getSeacrhTodo = async () => {

    const q = query(
      collection(firestore, "todos"),
      where("createdBy.uid", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    const array = querySnapshot.docs.map((doc) => doc.data());

    const filteredTodos = array.filter(todo =>
      todo.title.toLowerCase().includes(searchTodo.toLowerCase())
    );

    setDocuments(filteredTodos);
    setDocuments(filteredTodos);
  };

  useEffect(() => {
    if (selectedData) {
      getTodos(selectedData);
    }
  }, [selectedData]);

  useEffect(() => {
    getSeacrhTodo();
  }, [searchTodo])

  useEffect(() => {
    getTodos(selectedData);
  }, [calData]);

  const handleDelete = async (todo) => {

    try {
      await deleteDoc(doc(firestore, "todos", todo.id));

      let documentsAfterDelete = documents.filter(doc => doc.id !== todo.id)
      setAllDocuments(documentsAfterDelete)
      setDocuments(documentsAfterDelete)

      message.success("Todo deleted successfully")
    } catch (err) {
      console.error(err)
      message.error("something went wrong while delting todo")
    }
  }

  return (
    <>
      <main>
        <div className="container">
          <div className="row">
            <div className="col">
              {/* Heading */}
              <Title className='text-center mt-3'>Sticky Wall</Title>
              <Divider className='mb-0 custom-divider'>All Notes</Divider>
              <Card className='todoBorder'>
                {/* todos */}
                <div className="row">
                  {documents.map((todo, i) => (
                    <div key={i} className="col-lg-4 col-md-6 col-sm-12">
                      <Card className="todoBox p-1 overflow-hidden my-2" style={{ backgroundColor: todo.color }} key={i}>

                        <Meta className="overflow-hidden"
                          title={todo.title}
                        />
                        <Divider className='my-3' />
                        {todo.description}
                        <div className="card-actions w-100 bg-light opacity-25 position-absolute bottom-0 start-0 d-flex justify-content-between py-2 px-4">
                          <div className="date pt-1">
                            {todo.date ? dayjs(todo.date).format("dddd, DD/MM/YYYY") : ""}
                          </div>
                          <div className="actions">
                            <Space>
                              <Tooltip title="Delete" color="red">
                                <Button danger icon={<DeleteOutlined />} onClick={() => { handleDelete(todo) }} />
                              </Tooltip>
                              <Tooltip title="Edit">
                                <Button type="primary" icon={<EditOutlined />} onClick={() => { navigate(`/todos/eddtodo/${todo.id}`) }} />
                              </Tooltip>
                            </Space>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}

                  {/* Add Todo Box */}
                  <div className="col-lg-4 col-md-6 col-sm-12">
                    <Button
                      className='todoBox bg-primary p-1 w-100 fs-1 my-2'
                      onClick={() => { navigate(`/todos/addtodo`) }}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </Card>



            </div>
          </div>
        </div >
      </main >
    </>
  )
}
