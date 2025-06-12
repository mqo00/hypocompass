const ChatAvatar = ({ role }) =>
  // updated student/teacher icon to cat & dog to be more gender neutral
  {
    const avatars = {
      student:
        "https://cdn0.iconfinder.com/data/icons/phosphor-duotone-vol-2/256/dog-duotone-128.png",
      teacher:
        "https://cdn0.iconfinder.com/data/icons/esoteric-and-superstition-solid-fear-of-unknown/512/Black_cat-128.png",
      teacherboy:
        "https://cdn1.iconfinder.com/data/icons/education-791/512/reading-read-book-student-education-128.png",
      girl: "https://cdn1.iconfinder.com/data/icons/education-791/512/student-kid-children-school-girl-128.png",
      boy: "https://cdn1.iconfinder.com/data/icons/education-791/512/reading-read-book-student-education-128.png",
      student1:
        "https://cdn4.iconfinder.com/data/icons/avatar-circle-1-1/72/58-128.png",
      student2:
        "https://cdn4.iconfinder.com/data/icons/avatar-circle-1-1/72/37-128.png",
      student3:
        "https://cdn4.iconfinder.com/data/icons/avatar-circle-1-1/72/81-128.png",
    };
    return (
      <img
        src={avatars[role]}
        alt="Avatar"
        className="avatar"
        style={{
          width: "30pt",
          borderRadius: "50%",
          verticalAlign: "middle",
          aspectRatio: "1/1",
        }}
      />
    );
  };

export default ChatAvatar;
