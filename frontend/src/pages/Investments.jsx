import React, { useEffect, useState } from 'react'
import { Container, Typography, Paper, Grid } from '@mui/material'
import NavBar from '../components/NavBar'
import api from '../api/client'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function Investments() {
  const [data, setData] = useState({ list: [], insights: null })
  useEffect(()=>{ (async()=> setData(await api.get('/api/investments/me')))() }, [])
  const chartData = (data.insights?.riskDist || []).map(r => ({ name: r.risk, value: r.pct }))
  return (
    <>
      <NavBar />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>My Investments</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {data.list.map(i => (
              <Paper key={i.id} sx={{ p:2, mb:2, border: '1px solid #e6ebf1' }}>
                <Typography variant="h6">{i.name}</Typography>
                <Typography>Amount: ₹{Number(i.amount).toFixed(2)} | Expected Return: ₹{Number(i.expected_return).toFixed(2)}</Typography>
                <Typography>Risk: {i.risk} | Yield: {i.expected_annual_yield}%</Typography>
              </Paper>
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p:2, mb:2, border: '1px solid #e6ebf1' }}>
              <Typography variant="h6">Risk Distribution</Typography>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={80} label>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Paper>
            <Paper sx={{ p:2, border: '1px solid #e6ebf1' }}>
              <Typography variant="h6">AI Summary</Typography>
              <Typography>{data.insights?.summary || 'No data'}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
