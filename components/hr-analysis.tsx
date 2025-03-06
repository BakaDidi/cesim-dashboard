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

// Données d'évolution RH
const hrData = [
  {
    tour: "Tour 1",
    employesRD: 35,
    tauxRotation: 10.2,
    budgetFormation: 90000,
  },
  {
    tour: "Tour 2",
    employesRD: 40,
    tauxRotation: 9.5,
    budgetFormation: 100000,
  },
  {
    tour: "Tour 3",
    employesRD: 45,
    tauxRotation: 8.2,
    budgetFormation: 120000,
  },
  {
    tour: "Tour 4",
    employesRD: 48,
    tauxRotation: 7.8,
    budgetFormation: 135000,
  },
  {
    tour: "Tour 5",
    employesRD: 52,
    tauxRotation: 7.2,
    budgetFormation: 150000,
  },
]

// Données de comparaison RH
const hrComparisonData = [
  {
    name: "Notre Équipe",
    employesRD: 52,
    tauxRotation: 7.2,
  },
  {
    name: "Concurrent 1",
    employesRD: 48,
    tauxRotation: 8.5,
  },
  {
    name: "Concurrent 2",
    employesRD: 45,
    tauxRotation: 9.2,
  },
  {
    name: "Concurrent 3",
    employesRD: 40,
    tauxRotation: 10.5,
  },
  {
    name: "Concurrent 4",
    employesRD: 38,
    tauxRotation: 11.2,
  },
]

export function HRAnalysis() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Évolution des Ressources Humaines</CardTitle>
          <CardDescription>Évolution du nombre d'employés R&D et du taux de rotation</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={hrData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tour" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="employesRD" name="Employés R&D" stroke="#8884d8" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="tauxRotation"
                name="Taux de Rotation (%)"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Budget Formation</CardTitle>
          <CardDescription>Évolution du budget de formation</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={hrData}
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
              <Area type="monotone" dataKey="budgetFormation" name="Budget Formation" stroke="#ffc658" fill="#ffc658" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Comparaison RH</CardTitle>
          <CardDescription>Comparaison des employés R&D et du taux de rotation entre équipes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={hrComparisonData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="employesRD" name="Employés R&D" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="tauxRotation" name="Taux de Rotation (%)" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

