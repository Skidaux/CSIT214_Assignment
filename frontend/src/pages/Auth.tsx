import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/src/hooks/use-auth";

type AuthTab = "login" | "register";

export default function Auth() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="mx-auto w-full max-w-md">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as AuthTab)}
        className="gap-4"
      >
        <TabsList
          variant="line"
          className="grid h-auto w-full grid-cols-2"
        >
          <TabsTrigger value="login" className="py-3">
            Login
          </TabsTrigger>
          <TabsTrigger value="register" className="py-3">
            Register
          </TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm
            onAuthenticated={() => navigate("/dashboard", { replace: true })}
            onRegisterClick={() => setActiveTab("register")}
          />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm
            onAuthenticated={() => navigate("/dashboard", { replace: true })}
            onLoginClick={() => setActiveTab("login")}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
