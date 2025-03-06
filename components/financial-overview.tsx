"use client"

import { useState, useEffect } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function FinancialOverview() {
  const [data, setData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/financial-overview")
      const result = await response.json()
      setData(result)
    }
    fetchData()
  }, [])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="tour" />
        <YAxis />
        <Tooltip formatter={(value) => `€${value.toLocaleString("fr-FR")}`} labelFormatter={(label) => `${label}`} />
        <Area type="monotone" dataKey="revenuEurope" stackId="1" stroke="#8884d8" fill="#8884d8" />
        <Area type="monotone" dataKey="revenuGlobal" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
        <Area type="monotone" dataKey="beneficeNetEurope" stackId="3" stroke="#ffc658" fill="#ffc658" />
        <Area type="monotone" dataKey="beneficeNetGlobal" stackId="4" stroke="#ff8042" fill="#ff8042" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

