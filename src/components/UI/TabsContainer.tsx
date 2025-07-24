import { Tabs, Tab, Box } from "@mui/material";
import { useState } from "react";

interface Props {
    tabs: { label: string; content: React.ReactNode }[];
}

export default function TabsContainer({ tabs }: Props) {
    const [value, setValue] = useState(0);

    return (
        <Box sx={{ width: "100%", mt: 4 }}>
            <Tabs
                value={value}
                onChange={(_, newValue) => setValue(newValue)}
                aria-label="match tabs"
                variant="scrollable"
                scrollButtons="auto"
            >
                {tabs.map((tab, index) => (
                    <Tab key={index} label={tab.label} />
                ))}
            </Tabs>
            <Box sx={{ mt: 2 }}>{tabs[value].content}</Box>
        </Box>
    );
}
