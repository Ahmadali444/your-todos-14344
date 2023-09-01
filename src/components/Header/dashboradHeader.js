import React, { useEffect, useState } from 'react';
// Import Icons
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  DoubleRightOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
  BookOutlined,
  BgColorsOutlined,
  SettingOutlined,
  AlignLeftOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { Button, ColorPicker, DatePicker, Menu, message } from 'antd';
import { auth } from '../../config/firebase'
import { useAuthContext, useSelectDataContext, useCalDataContext, useSearchTodoContext } from '../../contexts/AuthContext'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom';



const getItem = (label, key, icon, children, type, onClick) => {
  return {
    key,
    icon,
    children,
    label,
    type,
    onClick,
  };
};
const items = [
  {
    label: 'TASKS',
    key: 'sub1',
    icon: <OrderedListOutlined />,
    children: [
      // set Pages
      getItem('Upcoming', '1', <DoubleRightOutlined />, null, 'item', 'handleItemClick'),
      getItem('Today', '2', <UnorderedListOutlined />, null, 'item', 'handleItemClick'),
      // getItem('Calendar', '3', <CalendarOutlined />, null, 'item', 'handleItemClick'),
      getItem('Todos', '4', <BookOutlined />, null, 'item', 'handleItemClick'),
    ],
  },
  {
    label: 'Calendar',
    key: 'sub4',
    icon: <CalendarOutlined />,
    children: [
      getItem('subCalendar', '7', <DatePicker
        id='setData'
        className='w-100'
      />, null, 'item', 'handleItemClick'),
    ],
  },
  {
    label: 'Lists',
    key: 'sub2',
    icon: <BgColorsOutlined />,
    children: [
      getItem('Peronal', '5', <ColorPicker size="small" />, null, 'item', 'handleItemClick'),
      getItem('Work', '6', <ColorPicker />, null, 'item', 'handleItemClick'),
    ],
  },
];


export default function DashboardHeader() {
  const [collapsed, setCollapsed] = useState(true);
  const { selectedData, setSelectedData } = useSelectDataContext();
  const { calData, setCalData } = useCalDataContext();
  const { user } = useAuthContext();
  // Search Box
  const { searchTodo, setSearchTodo } = useSearchTodoContext();
  
  const enterEmojiDitails = () => {
    let text = document.getElementById("searchData").value;
    setSearchTodo(text);
  }

  useEffect(() => {
    console.log("Selected setSearchTodo Updated:", searchTodo);
  }, [searchTodo]);

  const handleItemClick = (itemName) => {
    setSelectedData(itemName);

    if (selectedData === "subCalendar") {
      let a = document.getElementById("setData").value
      setCalData(a);
    }
  }

  useEffect(() => {
    console.log("Selected calData1 Updated:", calData);
  }, [calData]);

  useEffect(() => {
    console.log("Selected Data Updated:", selectedData);
  }, [selectedData]);

  // onClick on Collapse Button 
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleSettings = () => {
    navigate(`/settings/${user.uid}`);
  }

  const navigate = useNavigate();
  const { isAuth, dispatch } = useAuthContext()
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        message.success("Signout successful")
        dispatch({ type: "SET_LOGGED_OUT" })
        navigate(`/auth/login/`)
      })
      .catch(err => {
        message.error("Signout not successful")
      })
  }

  return (
    <div
      className='layout-set'
      style={{
        minHeight: '100vh',
      }}
    >
      {/* Start Menu */}
      <Menu
        defaultSelectedKeys={['4']}
        defaultOpenKeys={['sub1']}
        mode="inline"
        inlineCollapsed={collapsed}
        className='py-4 px-3 h-100 bg-secondary'
      >

        <h3 className={collapsed ? 'd-none' : 'd-inline'}>Menu</h3>
        <Button
          className='float-end px-3 py-0'
          type="$primary"
          onClick={toggleCollapsed}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>

        {/* Search Bar */}
        {collapsed ? <> <div class="input-group ms-2">
          <span class="input-group-text p-2 mt-2" id="basic-addon1"><SearchOutlined onClick={() => { setCollapsed(!collapsed); }} /></span></div></>
          : <> <div class="input-group mt-3 mb-4"> <span class="input-group-text bg-primary" id="basic-addon1"><SearchOutlined /></span>
            <input id='searchData' onChange={enterEmojiDitails} type="text" class="form-control bg-primary" allowClear placeholder="Search Todo by Title" aria-label="Username"
              aria-describedby="basic-addon1" /></div> </>}

        {/* Show Pages Name with Icon */}
        {items.map(item => {
          if (item.children) {
            return (
              <Menu.SubMenu key={item.key} icon={item.icon} title={item.label}>
                {item.children.map(childItem => (
                  <Menu.Item className='py-0' key={childItem.key} icon={childItem.icon}
                    onClick={() => handleItemClick(childItem.label)} >
                    {childItem.label}
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
            );
          }
          return (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.label}
            </Menu.Item>
          );
        })}
        {/* Setting and Sign Out menu items */}

        <Menu.SubMenu key="sub3" icon={<AlignLeftOutlined />} title="Other">
          <Menu.Item key="setting" icon={<SettingOutlined />} onClick={handleSettings}>
            Setting
          </Menu.Item>
          <Menu.Item key="signout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Sign Out
            {!isAuth
              ? <></>
              : <></>
            }
          </Menu.Item>
        </Menu.SubMenu>

      </Menu>
    </div>
  );
}
