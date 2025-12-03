import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DonutRings from '../../assets/DonutRings';
import FlameIcon from '../../assets/FlameIcon';
import { BottomSheet } from '../../components/BottomSheet';
import { MacroCard } from '../../components/MacroCard';
import { MealCard } from '../../components/MealCard';
import { MealItem } from '../../components/MealItem';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

export default function Index() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <ThemedView style={styles.root}>
      <ScrollView className='flex-1 p-[2em] pl-3 pr-3' contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View className='' style={styles.header}>
          <TouchableOpacity style={styles.iconButton}>
            <ThemedText type="default" style={styles.chev}>&lt;</ThemedText>
          </TouchableOpacity>
          <ThemedText type="defaultSemiBold" style={styles.title}>Today</ThemedText>
          <TouchableOpacity style={styles.iconButton}>
            <ThemedText type="default" style={styles.chev}>&gt;</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.centerArea}>
          <View style={styles.donutWrap}>
            <DonutRings />
            <View style={styles.centerOverlay}>
              <View style={styles.flameBg}>
                <View className='mt-1'><FlameIcon size={30} /></View>
              </View>
              <ThemedText type="default" style={styles.subText}>Of 2,340 Kcal</ThemedText>
              <ThemedText type="title" style={styles.kcal}>1,210</ThemedText>
            </View>
          </View>

          <View style={styles.macrosRow} className='mx-2'>
            <MacroCard
              title="Carbs"
              color="#4CAF50"
              percentage={55}
              current="0"
              target="285 g"
              backgroundColor="#DCEEDC"
            />
            <MacroCard
              title="Fat"
              color="#00BCD4"
              percentage={65}
              current="0"
              target="70 g"
              backgroundColor="#D1F1F4"
            />
            <MacroCard
              title="Protein"
              color="#FF9800"
              percentage={48}
              current="0"
              target="150 g"
              backgroundColor="#FEEACE"
            />
          </View>
        </View>

        <View className="pb-24" style={styles.mealsList}>
          <MealCard title="Breakfast" onAdd={() => { }}>
            <MealItem
              name="Scrambled Eggs"
              description="2 large eggs"
              calories="156 cal"
            />
            <MealItem
              name="Whole Wheat Toast"
              description="2 slices"
              calories="160 cal"
            />
          </MealCard>

          <MealCard
            title="Lunch"
            onAdd={() => { }}
            emptyText="No lunch logged. Tap '+' to add food."
          />

          <MealCard
            title="Dinner"
            onAdd={() => { }}
            emptyText="No dinner logged. Tap '+' to add food."
          />

          <MealCard
            title="Snacks"
            onAdd={() => { }}
            emptyText="No snacks logged. Tap '+' to add food."
          />
        </View>
      </ScrollView>



      <TouchableOpacity style={styles.fab} onPress={() => setIsSheetOpen(true)}>
        <Text className='text-white text-5xl'>+</Text>
      </TouchableOpacity>

      <BottomSheet isVisible={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        <ThemedText type="title">Add Item</ThemedText>
        <ThemedText>Select an option to add to your daily log.</ThemedText>
        {/* Placeholder content */}
        <View style={{ height: 200 }} />
      </BottomSheet>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { paddingBottom: 10, minHeight: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, textAlign: 'center' },
  chev: { fontSize: 18 },
  centerArea: { alignItems: 'center', marginTop: 8 },
  donutWrap: { width: 280, height: 280, alignItems: 'center', justifyContent: 'center' },
  centerOverlay: { position: 'absolute', width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  flameBg: { width: 40, height: 40, borderRadius: 100, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center', marginBottom: 0 },
  subText: { fontSize: 14, color: '#777' },
  kcal: { fontSize: 40, fontWeight: '700' },
  macrosRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  mealsList: { marginTop: 16, gap: 12 },
  fab: { position: 'absolute', right: 25, bottom: 100, width: 60, height: 60, borderRadius: 32, backgroundColor: '#32B8C6', alignItems: 'center', justifyContent: 'center', elevation: 6 },
});
