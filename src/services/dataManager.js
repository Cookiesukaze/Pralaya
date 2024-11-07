// dataManager.js
import { ref } from 'vue';
import { getAllGraph, getUser, getIP } from '../api/method.js';
import { graphs as fakeGraph, user as fakeUser } from '../assets/data/fakeData';

const graph = ref([]);
const user = ref({});
const ipInfo = ref(null);

const fetchGraph = async () => {
    try {
        const response = await getAllGraph();
        //添加一个current字段
        graph.value = response.data.map((item, index) => ({
            ...item,
            current: index === 0
        }));
        console.log('dataManager: graph:', graph.value);

    } catch (error) {
        console.error('dataManager: Error fetching graph:', error);
        graph.value = fakeGraph; // 使用假数据
    }
};

const fetchUser = async () => {
    try {
        const response = await getUser();
        user.value = response.data;
        console.log('dataManager: user:', user.value);
    } catch (error) {
        console.error('dataManager: Error fetching user:', error);
        user.value = fakeUser; // 使用假数据
    }
};

const fetchIPInfo = async () => {
    try {
        const response = await getIP();
        ipInfo.value = response.data;
        console.log('dataManager: IP:', ipInfo.value);
    } catch (error) {
        console.error('Error fetching IP info:', error);
    }
};

export { graph, user, ipInfo, fetchGraph, fetchUser, fetchIPInfo };
