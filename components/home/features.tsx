import {
  Avatar,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
} from "@mui/material";
import React from "react";
import classes from "./home.module.scss";
import Image from "next/image";

interface FeaturesProps {}

const featureList = [
  {
    icon: "ai_icon.png",
    title: "Nhận diện gương mặt",
    content:
      "AI và học máy để phát hiện gian lận bằng cách theo dõi chuyển động khuôn mặt",
  },
  // {
  //   icon: "cross_platform.png",
  //   title: "Cross Platform",
  //   content: "This platform is availabe on Web, Android and iOS",
  //   padding: "12px",
  //   color: "darkmagenta",
  // },
  // {
  //   icon: "phone_lock_icon.png",
  //   title: "Ngăn chặn chụp ảnh màn hình",
  //   content: "The mobile version of the app blocks any form of screen capture",
  //   padding: "12px",
  //   color: "lightblue",
  // },
  {
    icon: "cross_icon.svg",
    title: "Chặn thoát ứng dụng",
    content: "Người dùng không thể thoát khỏi ứng dụng hoặc thay đổi tab trong khi thi",
    padding: "0px",
  },
  {
    icon: "assesment_icon.svg",
    title: "Đánh giá và kiểm tra",
    content: "Hỗ trợ đánh giá và kiểm tra ngay lập tức",
    padding: "0px",
    color: "midnightblue",
  },
  // {
  //   icon: "video_icon.svg",
  //   color: "#DD7F6B",
  //   title: "Video giám sát",
  //   content: "Support for live video proctoring (future support)",
  // },
  // {
  //   icon: "comm_icon.svg",
  //   title: "Giao tiếp trực tuyên",
  //   content:
  //     "Live real time communication between user and proctor (future support)",
  //   padding: "12px",
  //   color: "midnightblue",
  // },
];

const Features: React.FC<FeaturesProps> = () => {
  return (
    <section className={classes.featureSection}>
      <Container>
        <h1>Chức năng chính</h1>

        <Grid
          container
          rowSpacing={5}
          columnSpacing={5}
          justifyContent="center"
        >
          {featureList.map((feature, i) => {
            return (
              <Grid item key={i}>
                <Card
                  sx={{
                    maxWidth: "320px",
                    backgroundColor: "white",
                    borderRadius: "0.85rem",
                    boxShadow: "0 5px 25px rgb(0 0 0 / 8%)",
                    padding: "1rem",
                    height: "100%",
                    textAlign: "center",
                  }}
                >
                  <CardMedia>
                    <Avatar
                      sx={{
                        height: "60px",
                        width: "60px",
                        padding: feature.padding ?? "4px",
                        backgroundColor: feature.color,
                        margin: "0 auto",
                      }}
                    >
                      <Image
                        src={`/images/icon/${feature.icon}`}
                        height="64px"
                        width="64px"
                        alt="icon"
                      />
                    </Avatar>
                  </CardMedia>

                  <CardContent>
                    <h3>{feature.title}</h3>
                    <p>{feature.content}</p>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </section>
  );
};

export default Features;
