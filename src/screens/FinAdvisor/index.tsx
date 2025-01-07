
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card } from '@rneui/themed';
import { BarChart } from 'react-native-chart-kit';

export function FinAdvisor() {
  const data = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr'],
    datasets: [{
      data: [2000, 1500, 3000, 2500]
    }]
  };

  return (
    <ScrollView style={styles.container}>
      <Text h3 style={styles.title}>Dashboard Financiero</Text>
      
      <Card containerStyle={styles.card}>
        <Card.Title>Balance General</Card.Title>
        <BarChart
          data={data}
          width={300}
          height={200}
          yAxisLabel="$"
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => `rgba(0, 150, 199, ${opacity})`
          }}
        />
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title>Últimas Transacciones</Card.Title>
        <View>
          <Text>Próximamente...</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    padding: 15,
    textAlign: 'center',
  },
  card: {
    borderRadius: 10,
    marginBottom: 15,
  }
});
