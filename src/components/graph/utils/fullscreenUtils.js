// fullscreenUtils.js


export const toggleFullscreen = async (element) => {
    try {
        if (document.fullscreenElement) {
            console.log('Exiting fullscreen');
            await document.exitFullscreen();
        } else {
            console.log('Requesting fullscreen for element:', element);
            await element.requestFullscreen();
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
