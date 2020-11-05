import { InferGetServerSidePropsType } from "next";
import { AppController } from "../backend/app/app.controller";
import { Backend } from "../backend/main";

export async function getServerSideProps() {
  const app = await Backend.getApp();

  const controller = app.get(AppController);
  
  return {
    props: {
      randomNumber: controller.randomNumber()
    }
  }
}

export default function GsspExample(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <p>
      Random Number: {props.randomNumber}
    </p>
  )
}
