import { useThemeColor } from '@/hooks/use-theme-color'
import { msBarChart } from '@material-symbols-react-native/rounded-400/msBarChart'
import { msMenuBook } from '@material-symbols-react-native/rounded-400/msMenuBook'
import { msRestaurant } from '@material-symbols-react-native/rounded-400/msRestaurant'
import { Tabs } from 'expo-router'
import { MsIcon } from 'material-symbols-react-native'
import React from 'react'
import { Text, View } from 'react-native'

const TabIcon = ({
    focused,
    Icon,
    title,
    activeColor,
    inactiveColor,
}: {
    focused: boolean
    Icon: any
    title: string
    activeColor: string
    inactiveColor: string
}) => {
    return (
        <View className='flex mt-6 justify-center items-center rounded-full size-16'>
            {focused && <View
                className="absolute w-[6em] h-[3.8em] -bottom-[.1em] rounded-full z-10 opacity-75"
                style={{ backgroundColor: activeColor + '20' }} // 20% opacity for glow
            />}
            <Text className=''>
                <MsIcon
                    icon={Icon}
                    size={24}
                    color={focused ? activeColor : inactiveColor}
                />
            </Text>
            <Text
                style={{ color: focused ? activeColor : inactiveColor }}
                className={`text-xs ${focused ? 'font-bold' : ''} mt-1`}
            >
                {title}
            </Text>
        </View >
    )
}

const _Layout = () => {
    const backgroundColor = useThemeColor({}, 'card')
    const borderColor = useThemeColor({}, 'border')
    const activeColor = useThemeColor({}, 'tabIconSelected')
    const inactiveColor = useThemeColor({}, 'tabIconDefault')

    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    height: '100%',
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarStyle: {
                    backgroundColor: backgroundColor,
                    borderRadius: 50,
                    marginHorizontal: 35,
                    marginBottom: 20,
                    height: 65,
                    position: 'absolute',
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: borderColor,
                    shadowOffset: {
                        width: 0,
                        height: 0,
                    },
                    opacity: 0.75,
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Food Log',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            Icon={msMenuBook}
                            title="Food Log"
                            activeColor={activeColor}
                            inactiveColor={inactiveColor}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="insights"
                options={{
                    title: 'Insights',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            Icon={msBarChart}
                            title="Insights"
                            activeColor={activeColor}
                            inactiveColor={inactiveColor}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="library"
                options={{
                    title: 'Library',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            Icon={msRestaurant}
                            title="Library"
                            activeColor={activeColor}
                            inactiveColor={inactiveColor}
                        />
                    ),
                }}
            />
        </Tabs>
    )
}

export default _Layout