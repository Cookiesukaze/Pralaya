// fullscreenUtils.js


// fullscreenUtils.js

import {debounce} from "lodash";

export const toggleFullscreen = async (element) => {
    try {
        if (document.fullscreenElement) {
            console.log('Exiting fullscreen');
            await document.exitFullscreen(); // 确保退出全屏的异步操作完成
        } else {
            console.log('Requesting fullscreen for element:', element);
            await element.requestFullscreen(); // 确保进入全屏的异步操作完成
        }
    } catch (error) {
        console.error('Error toggling fullscreen:', error);
    }
};

// 监听全屏模式变化并更新样式
export const handleFullscreenChange = (toolbarComponent, searchComponent, outerContainer) => {
    const isFullscreen = !!document.fullscreenElement;

    if (toolbarComponent && searchComponent) {
        const toolbarEl = toolbarComponent.$el;
        const searchEl = searchComponent.$el;

        if (isFullscreen) {
            // 工具栏全屏样式
            toolbarEl.style.position = 'fixed';
            toolbarEl.style.top = '10px';
            toolbarEl.style.right = '10px';
            toolbarEl.style.zIndex = '10000';

            // 搜索框全屏样式
            searchEl.style.position = 'fixed';
            searchEl.style.bottom = '10px';
            searchEl.style.left = '2%';
            searchEl.style.zIndex = '10000';
            searchEl.style.width = '96%';
            searchEl.style.padding = '10px';
            searchEl.style.boxSizing = 'border-box';

        } else {
            // 退出全屏时恢复默认的样式
            toolbarEl.style.position = '';
            toolbarEl.style.top = '';
            toolbarEl.style.right = '';
            toolbarEl.style.zIndex = '';

            searchEl.style.position = '';
            searchEl.style.bottom = '';
            searchEl.style.left = '';
            searchEl.style.zIndex = '';
            searchEl.style.width = '';
            searchEl.style.padding = '';
            searchEl.style.boxSizing = '';
        }
    }
    if (!document.fullscreenElement) {
        outerContainer.classList.remove('fullscreen');
    }
};

// 创建防抖的全屏切换函数
export const createDebouncedFullscreenToggle = (graphRef, containerRef, updateGraphSize) => {
    return debounce(async () => {
        try {
            if (document.fullscreenElement) {
                await toggleFullscreen(containerRef.value);
                graphRef.value.classList.remove('fullscreen');
                containerRef.value.classList.remove('fullscreen');
            } else {
                containerRef.value.classList.add('fullscreen');
                graphRef.value.classList.add('fullscreen');
                await toggleFullscreen(containerRef.value);
            }
            await updateGraphSize();
        } catch (error) {
            console.error("Error during fullscreen toggle:", error);
        }
    }, 100);
};
