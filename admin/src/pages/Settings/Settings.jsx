import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Giao diện</CardTitle>
          <CardDescription>
            Tùy chỉnh giao diện của trang quản trị
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              className="flex items-center space-x-2"
            >
              <Sun className="h-4 w-4" />
              <span>Light Mode</span>
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              className="flex items-center space-x-2"
            >
              <Moon className="h-4 w-4" />
              <span>Dark Mode</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}