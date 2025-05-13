import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CardItem = ({ title, value, currency, percentage }) => {
    return (
        <Card className=" rounded-xl shadow-lg p-3 w-96">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-sm text-gray-400">{title}</CardTitle>
                <span className="text-gray-400 text-lg">{currency}</span>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{value}</CardContent>
            <CardContent className="text-sm  ">{percentage} </CardContent>
        </Card>
    );
};

export default CardItem;
