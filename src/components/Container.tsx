import React from "react";

const Container = ({ children }: { children: React.ReactNode }) => {
  return <main className=" md:mx-64 text-center">{children}</main>;
};

export default Container;
