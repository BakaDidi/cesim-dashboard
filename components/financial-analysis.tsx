"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Données d'évolution financière
const financialData = [
  {
    tour: "Tour 1",
    revenuEurope: 1200000,
    revenuGlobal: 2100000,
    beneficeNetEurope: 350000,
    beneficeNetGlobal: 580000,
    rendementCumulatif: 5.2,
  },
  {
    tour: "Tour 2",
    revenuEurope: 1350000,
    revenuGlobal: 2280000,
    beneficeNetEurope: 410000,
    beneficeNetGlobal: 650000,
    rendementCumulatif: 8.7,
  },
  {
    tour: "Tour 3",
    revenuEurope: 1420000,
    revenuGlobal: 2350000,
    beneficeNetEurope: 430000,
    beneficeNetGlobal: 680000,
    rendementCumulatif: 12.5,
  },
  {
    tour: "Tour 4",
    revenuEurope: 1520000,
    revenuGlobal: 2480000,
    beneficeNetEurope: 460000,
    beneficeNetGlobal: 720000,
    rendementCumulatif: 15.8,
  },
  {
    tour: "Tour 5",
    revenuEurope: 1650000,
    revenuGlobal: 2620000,
    beneficeNetEurope: 490000,
    beneficeNetGlobal: 780000,
    rendementCumulatif: 18.3,
  },
]

// Données de comparaison des revenus
const revenueComparisonData = [
  { name: "Tour 1", europe: 1200000, global: 2100000 },
  { name: "Tour 2", europe: 1350000, global: 2280000 },
  { name: "Tour 3", europe: 1420000, global: 2350000 },
  { name: "Tour 4", europe: 1520000, global: 2480000 },
  { name: "Tour 5", europe: 1650000, global: 2620000 },
]

export function FinancialAnalysis() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Évolution des Revenus</CardTitle>
          <CardDescription>Comparaison des revenus Europe vs Global au fil des tours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={financialData}
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
              <Tooltip
                formatter={(value) =>
                  `${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value as number)}`
                }
              />
              <Legend />
              <Area type="monotone" dataKey="revenuEurope" name="Revenu Europe" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="revenuGlobal" name="Revenu Global" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Rendement Cumulatif</CardTitle>
          <CardDescription>Évolution du rendement cumulatif aux actionnaires</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={financialData}
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
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Line type="monotone" dataKey="rendementCumulatif" name="Rendement Cumulatif (%)" stroke="#ff8042" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Comparaison des Bénéfices Nets</CardTitle>
          <CardDescription>Comparaison des bénéfices nets Europe vs Global</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={revenueComparisonData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value) =>
                  `${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value as number)}`
                }
              />
              <Legend />
              <Bar dataKey="europe" name="Europe" fill="#8884d8" />
              <Bar dataKey="global" name="Global" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

