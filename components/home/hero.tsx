import React from "react";
import classes from "./home.module.scss";
import { Button, Container, Stack } from "@mui/material";
import Image from "next/image";
import GitHubIcon from "@mui/icons-material/GitHub";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import LoginIcon from "@mui/icons-material/Login";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LoadingBarRef } from "react-top-loading-bar";

interface HeroProps {
  loadingBarRef: React.RefObject<LoadingBarRef>;
}

const Hero: React.FC<HeroProps> = ({ loadingBarRef }) => {
  const session = useSession();

  const showLoadingWidget = () => {
    loadingBarRef.current.continuousStart(50);
  };

  return (
    <React.Fragment>
      <section className={classes.heroSection}>
        <Container>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <div style={{textAlign: 'center'}}>
              <h1>Phần mềm thi online</h1>

              <p>
                Hỗ trợ phát hiện gian lận trong thi trực tuyến sử dụng trí tuệ nhân tạo
              </p>

              <Stack direction="row" justifyContent="center" alignItems="center" className={classes.buttonGroup}>
                {/* <Link
                  href="https://github.com/prathamesh-mutkure/anti-cheat-exam-app"
                  target="_blank"
                >
                  <Button
                    startIcon={<GitHubIcon />}
                    variant="contained"
                    size="large"
                    color="primary"
                  >
                    Mobile App
                  </Button>
                </Link> */}

                {session.status === "authenticated" ? (
                  <Link href="/dashboard">
                    <Button
                      startIcon={<ArrowOutwardIcon />}
                      variant="contained"
                      size="large"
                      color="primary"
                      onClick={showLoadingWidget}
                    >
                      Bảng điều khiển
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/login">
                    <Button
                      startIcon={<LoginIcon />}
                      variant="contained"
                      size="large"
                      color="primary"
                      disabled={session.status === "loading"}
                      onClick={showLoadingWidget}
                    >
                      Đăng nhập
                    </Button>
                  </Link>
                )}
              </Stack>
            </div>

            {/* <div className={classes.phone}>
              <Image
                src="/images/hero_img.png"
                width="300px"
                height="600px"
                alt="Hero Image"
              />
            </div> */}
          </Stack>
        </Container>
      </section>
    </React.Fragment>
  );
};

export default Hero;
