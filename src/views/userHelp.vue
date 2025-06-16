<template>
  <div class="help-container">
    <!-- 左侧内容区 -->
    <div class="help-content" ref="contentRef" @scroll="handleContentScroll">
      <div class="content-section" ref="introductionRef" id="introduction">
        <h2>系统介绍</h2>
        <div class="content-body">
          <p>MSDPT（Mass Spectrometry Data Processing Tool）是一个专业的质谱数据处理工具系统。本系统致力于为科研人员提供高效、便捷的数据处理解决方案。</p>
          
          <h3>系统特点</h3>
          <ul>
            <li>支持多种仪器厂商数据格式，包括安捷伦、岛津、AB等主流品牌</li>
            <li>提供便捷的数据处理流程，自动化处理减少人工操作</li>
            <li>可视化的数据展示，直观展现分析结果</li>
            <li>灵活的数据导出功能，支持多种格式导出</li>
          </ul>

          <h3>适用场景</h3>
          <p>本系统主要适用于以下场景：</p>
          <ul>
            <li>科研院所的实验数据分析</li>
            <li>质检机构的常规检测</li>
            <li>企业研发部门的数据处理</li>
          </ul>
        </div>
      </div>

      <div class="content-section" ref="gcRef" id="gc">
        <h2>气相数据处理</h2>
        <div class="content-body">
          <h3>支持的仪器型号</h3>
          <ul>
            <li>安捷伦7890系列</li>
            <li>岛津GC-2010系列</li>
            <li>其他兼容型号</li>
          </ul>

          <h3>使用流程</h3>
          <ol>
            <li>
              <strong>数据上传</strong>
              <p>支持单个文件上传或批量上传，支持的文件格式：.D、.gcd等</p>
            </li>
            <li>
              <strong>参数设置</strong>
              <p>可设置峰识别阈值、积分参数等</p>
            </li>
            <li>
              <strong>数据处理</strong>
              <p>自动进行基线校正、峰识别、峰面积计算等</p>
            </li>
            <li>
              <strong>结果导出</strong>
              <p>支持Excel、PDF等格式导出</p>
            </li>
          </ol>

          <h3>注意事项</h3>
          <p>使用过程中请注意以下几点：</p>
          <ul>
            <li>确保数据文件完整性</li>
            <li>参数设置要根据实际需求调整</li>
            <li>定期备份重要数据</li>
          </ul>
        </div>
      </div>

      <div class="content-section" ref="gcmsRef" id="gcms">
        <h2>气质数据处理</h2>
        <div class="content-body">
          <h3>功能特点</h3>
          <ul>
            <li>全扫描数据分析</li>
            <li>选择离子监测</li>
            <li>质谱图库匹配</li>
          </ul>

          <h3>数据处理流程</h3>
          <p>详细的处理步骤说明...</p>
        </div>
      </div>

      <div class="content-section" ref="uploadRef" id="upload">
        <h2>数据上传</h2>
        <div class="content-body">
          <h3>上传方式</h3>
          <ul>
            <li>单文件上传</li>
            <li>批量上传</li>
            <li>文件夹上传</li>
          </ul>

          <h3>支持的文件格式</h3>
          <table class="feature-table">
            <thead>
              <tr>
                <th>仪器类型</th>
                <th>文件格式</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>气相色谱</td>
                <td>.D, .gcd, .chrom</td>
              </tr>
              <tr>
                <td>液相色谱</td>
                <td>.lcd, .dad</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 其他内容区域可以继续添加 -->
    </div>

    <!-- 右侧目录导航 -->
    <div class="help-sidebar">
      <div class="outline-header">
        <span>目录大纲</span>
      </div>
      <el-scrollbar>
        <div class="outline-menu">
          <div class="outline-item" 
               :class="{ active: activeMenu === 'introduction' }"
               @click="scrollToSection('introduction')">
            <div class="item-content">系统介绍</div>
          </div>
          
          <div class="outline-group">
            <div class="group-title">数据处理</div>
            <div class="outline-item" 
                 :class="{ active: activeMenu === 'gc' }"
                 @click="scrollToSection('gc')">
              <div class="item-content">气相数据处理</div>
            </div>
            <div class="outline-item" 
                 :class="{ active: activeMenu === 'gcms' }"
                 @click="scrollToSection('gcms')">
              <div class="item-content">气质数据处理</div>
            </div>
            <div class="outline-item" 
                 :class="{ active: activeMenu === 'lc' }"
                 @click="scrollToSection('lc')">
              <div class="item-content">液相数据处理</div>
            </div>
            <div class="outline-item" 
                 :class="{ active: activeMenu === 'lcms' }"
                 @click="scrollToSection('lcms')">
              <div class="item-content">液质数据处理</div>
            </div>
          </div>

          <div class="outline-group">
            <div class="group-title">功能说明</div>
            <div class="outline-item" 
                 :class="{ active: activeMenu === 'upload' }"
                 @click="scrollToSection('upload')">
              <div class="item-content">数据上传</div>
            </div>
            <div class="outline-item" 
                 :class="{ active: activeMenu === 'process' }"
                 @click="scrollToSection('process')">
              <div class="item-content">数据处理</div>
            </div>
            <div class="outline-item" 
                 :class="{ active: activeMenu === 'download' }"
                 @click="scrollToSection('download')">
              <div class="item-content">数据下载</div>
            </div>
            <div class="outline-item" 
                 :class="{ active: activeMenu === 'search' }"
                 @click="scrollToSection('search')">
              <div class="item-content">数据检索</div>
            </div>
          </div>

          <div class="outline-item" 
               :class="{ active: activeMenu === 'faq' }"
               @click="scrollToSection('faq')">
            <div class="item-content">常见问题</div>
          </div>

          <div class="outline-item" 
               :class="{ active: activeMenu === 'contact' }"
               @click="scrollToSection('contact')">
            <div class="item-content">联系我们</div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const activeMenu = ref('introduction')
const contentRef = ref(null)

// 完善sectionRefs的定义
const sectionRefs = {
  introductionRef: ref(null),
  gcRef: ref(null),
  gcmsRef: ref(null),
  uploadRef: ref(null),
  lcRef: ref(null),
  lcmsRef: ref(null),
  processRef: ref(null),
  downloadRef: ref(null),
  searchRef: ref(null),
  faqRef: ref(null),
  contactRef: ref(null)
}

// 滚动到指定section
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    activeMenu.value = sectionId
  }
}

// 优化滚动检测逻辑
const handleContentScroll = () => {
  if (!contentRef.value) return

  const scrollTop = contentRef.value.scrollTop
  const viewportHeight = contentRef.value.clientHeight
  const SCROLL_OFFSET = 100 // 滚动偏移量，用于提前触发切换

  // 获取所有section元素
  const sections = document.querySelectorAll('.content-section')
  let currentSectionId = null

  // 遍历所有section，找到当前可见的section
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect()
    const sectionTop = rect.top
    const sectionBottom = rect.bottom
    
    // 判断section是否在视口中
    if (sectionTop <= SCROLL_OFFSET && sectionBottom >= SCROLL_OFFSET) {
      currentSectionId = section.id
    }
  })

  // 如果找到当前section，更新激活菜单
  if (currentSectionId) {
    activeMenu.value = currentSectionId
  }
}

// 添加防抖处理
const debounce = (fn, delay) => {
  let timer = null
  return function() {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, arguments), delay)
  }
}

onMounted(() => {
  // 初始滚动到顶部
  if (contentRef.value) {
    contentRef.value.scrollTop = 0
  }

  // 使用防抖处理滚动事件
  const debouncedScroll = debounce(handleContentScroll, 50)

  // 添加滚动监听
  contentRef.value?.addEventListener('scroll', debouncedScroll)
  
  // 初始调用一次，确保初始状态正确
  handleContentScroll()

  // 清理函数
  onUnmounted(() => {
    if (contentRef.value) {
      contentRef.value.removeEventListener('scroll', debouncedScroll)
    }
  })
})
</script>

<style scoped>
.help-container {
  display: flex;
  min-height: calc(100vh - 60px); /* 减去顶部导航栏的高度 */
  background-color: var(--el-bg-color);
  position: relative;
  overflow: hidden; /* 防止整个容器滚动 */
}

.help-content {
  flex: 1;
  padding: 24px 32px;
  height: calc(100vh - 60px); /* 设置固定高度 */
  overflow-y: auto; /* 允许内容区域滚动 */
  margin-right: 280px;
  scroll-behavior: smooth;
}

.help-sidebar {
  position: fixed;
  right: 0;
  top: 60px; /* 从导航栏下方开始 */
  bottom: 0;
  width: 280px;
  background-color: var(--el-bg-color-overlay);
  border-left: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 允许目录滚动 */
}

.outline-header {
  padding: 16px 20px;
  font-size: 18px;  /* 增大字号 */
  font-weight: 600;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);  /* 添加背景色 */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);  /* 添加阴影 */
}

.outline-menu {
  padding: 20px 16px;  /* 增加内边距 */
}

.outline-group {
  margin-bottom: 24px;  /* 增加组间距 */
  background-color: var(--el-fill-color-blank);  /* 添加背景色 */
  border-radius: 8px;  /* 圆角 */
  padding: 12px 8px;  /* 内边距 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);  /* 轻微阴影 */
}

.group-title {
  padding: 8px 16px;
  font-size: 15px;  /* 增大字号 */
  font-weight: 600;  /* 加粗 */
  color: var(--el-text-color-primary);  /* 加深颜色 */
  margin-bottom: 8px;
  position: relative;
  
  /* 添加左侧装饰线 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background-color: var(--el-color-primary);
    border-radius: 2px;
  }
}

.outline-item {
  padding: 8px 16px;
  margin: 4px 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  padding-left: 24px;  /* 为图标留出空间 */

  /* 添加悬停效果 */
  &:hover {
    background-color: var(--el-color-primary-light-9);
    transform: translateX(4px);  /* 添加位移效果 */
    
    .item-content {
      color: var(--el-color-primary);
    }
  }

  /* 激活状态样式 */
  &.active {
    background-color: var(--el-color-primary-light-8);
    
    .item-content {
      color: var(--el-color-primary);
      font-weight: 500;
    }

    /* 添加左侧标记 */
    &::before {
      content: '';
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: var(--el-color-primary);
    }
  }

  .item-content {
    font-size: 14px;
    color: var(--el-text-color-regular);
    transition: all 0.3s;
  }
}

/* 非分组的目录项特殊样式 */
.outline-menu > .outline-item {
  margin: 8px 0;
  background-color: var(--el-fill-color-blank);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 深色模式适配 */
:deep(.dark) {
  .outline-group {
    background-color: var(--el-bg-color-overlay);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .outline-menu > .outline-item {
    background-color: var(--el-bg-color-overlay);
  }

  .group-title {
    color: var(--el-text-color-primary);
    
    &::before {
      background-color: var(--el-color-primary-light-3);
    }
  }

  .outline-item {
    &:hover {
      background-color: var(--el-color-primary-dark-2);
    }
    
    &.active {
      background-color: var(--el-color-primary-dark-1);
      
      &::before {
        background-color: var(--el-color-primary-light-3);
      }
      
      .item-content {
        color: var(--el-color-primary-light-5);
      }
    }
  }
}

/* 内容区样式保持不变 */
.content-section {
  max-width: 800px;
  margin: 0 auto;
  padding-top: 20px;  /* 添加顶部间距 */
  padding-bottom: 40px;  /* 添加底部间距 */
  scroll-margin-top: 60px; /* 防止滚动时被顶部导航栏遮挡 */

  h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color-light);
    color: var(--el-text-color-primary);
  }

  h3 {
    font-size: 18px;
    font-weight: 500;
    margin: 20px 0 12px;
    color: var(--el-text-color-primary);
  }

  .content-body {
    color: var(--el-text-color-regular);
    line-height: 1.8;

    p {
      margin-bottom: 16px;
    }

    ul, ol {
      padding-left: 24px;
      margin-bottom: 16px;

      li {
        margin-bottom: 8px;
      }
    }
  }
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .help-content {
    margin-right: 0;
    padding: 16px;
  }

  .help-sidebar {
    position: fixed;
    right: -280px;
    transition: right 0.3s;
    z-index: 100;
    
    &.show {
      right: 0;
    }
  }
}

/* 在原有样式基础上添加 */
.feature-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  
  th, td {
    padding: 12px;
    border: 1px solid var(--el-border-color-light);
    text-align: left;
  }
  
  th {
    background-color: var(--el-color-primary-light-9);
    font-weight: 500;
  }
  
  tr:hover td {
    background-color: var(--el-fill-color-light);
  }
}

.content-body {
  strong {
    color: var(--el-text-color-primary);
    font-weight: 500;
  }

  p {
    margin: 8px 0 16px;
  }

  /* 添加内容块的间距 */
  h3 {
    margin-top: 32px;
  }

  /* 列表样式优化 */
  ul, ol {
    li {
      position: relative;
      padding-left: 8px;
      
      &::before {
        content: '';
        position: absolute;
        left: -12px;
        top: 10px;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: var(--el-color-primary);
      }
    }
  }
}

/* 深色模式适配补充 */
:deep(.dark) {
  .feature-table {
    th {
      background-color: var(--el-color-primary-dark-2);
    }
    
    td {
      border-color: var(--el-border-color-darker);
    }
    
    tr:hover td {
      background-color: var(--el-bg-color-overlay);
    }
  }
}

/* 内容区域的滚动条样式优化 */
.help-content::-webkit-scrollbar {
  width: 6px;
}

.help-content::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color-lighter);
  border-radius: 3px;
}

.help-content::-webkit-scrollbar-track {
  background-color: transparent;
}
</style> 