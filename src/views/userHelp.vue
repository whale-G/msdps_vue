<template>
  <div class="help-container">
    <!-- 左侧内容区 -->
    <div class="help-content" ref="contentRef" @scroll="handleContentScroll">
      <!-- 系统介绍 -->
      <div class="content-section" ref="introductionRef" id="introduction">
        <h2>系统介绍</h2>
        <div class="content-body">
          <div class="intro-card">
            <div class="intro-header">
              <el-icon class="intro-icon"><Monitor /></el-icon>
              <h3>小西数据员</h3>
            </div>
            <p class="intro-description">一个<b>高度定制化</b>的数据处理系统，主要用于处理各类质谱色谱实验仪器导出的报告文件。</p>
          </div>
          
          <div class="instruments-card">
            <h3 class="card-title">支持的仪器型号</h3>
            <div class="instruments-grid">
              <div class="instrument-type">
                <div class="type-header">
                  <el-icon><Cpu /></el-icon>
                  <span>气相色谱仪器（GC）</span>
                </div>
                <ul class="type-list">
                  <li>安捷伦气相-7890</li>
                </ul>
              </div>
              
              <div class="instrument-type">
                <div class="type-header">
                  <el-icon><Monitor /></el-icon>
                  <span>气质联用仪器（GCMS）</span>
                </div>
                <ul class="type-list">
                  <li>岛津气质-2010&8050</li>
                  <li>热电气质</li>
                </ul>
              </div>
              
              <div class="instrument-type">
                <div class="type-header">
                  <el-icon><Cpu /></el-icon>
                  <span>液相色谱仪器（LC）</span>
                </div>
                <ul class="type-list">
                  <li>安捷伦液相-1290</li>
                  <li>岛津液相-LC30&LC2030</li>
                </ul>
              </div>
              
              <div class="instrument-type">
                <div class="type-header">
                  <el-icon><Monitor /></el-icon>
                  <span>液质联用仪器（LCMS）</span>
                </div>
                <ul class="type-list">
                  <li>AB液质</li>
                  <li>安捷伦液质-6470</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="process-card">
            <h3 class="card-title">处理流程</h3>
            <div class="process-steps">
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>文件上传</h4>
                  <p>用户上传报告文件（目前多为Excel格式，部分类型支持Word格式）</p>
                </div>
              </div>
              
              <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>数据处理</h4>
                  <p>文件通过定制算法处理，得到用户需要的处理结果</p>
                </div>
              </div>
              
              <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>结果获取</h4>
                  <p>用户可以查看处理结果，并进行下载</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 文件上传 -->
      <div class="content-section" ref="uploadRef" id="upload">
        <h2>文件上传</h2>
        <div class="content-body">
          <div class="doc-card">
            <div class="doc-card-header">
              <el-icon class="card-icon"><Upload /></el-icon>
              <h3>系统支持的文件格式</h3>
            </div>
            <div class="doc-card-content">
              <table class="doc-table">
                <thead>
                  <tr>
                    <th>仪器型号</th>
                    <th>文件格式</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>安捷伦气相-7890</td>
                    <td>Excel(.xls, .xlsx)</td>
                  </tr>
                  <tr>
                    <td>岛津气质-2010&8050</td>
                    <td>Excel(.xls, .xlsx)</td>
                  </tr>
                  <tr>
                    <td>热电气质</td>
                    <td>Excel(.xls, .xlsx)</td>
                  </tr>
                  <tr>
                    <td>安捷伦液相-1290</td>
                    <td>Excel(.xls, .xlsx)</td>
                  </tr>
                  <tr>
                    <td>岛津液相-LC30&LC2030</td>
                    <td>Excel(.xls, .xlsx)</td>
                  </tr>
                  <tr>
                    <td>AB液质</td>
                    <td>Word(.docx)</td>
                  </tr>
                  <tr>
                    <td>安捷伦液质-6470</td>
                    <td>Excel(.xls, .xlsx)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据处理 -->
      <div class="content-section" ref="processRef" id="process">
        <h2>数据处理</h2>
        <div class="content-body">
          <div class="doc-card">
            <div class="doc-notice">
              <el-icon class="notice-icon"><InfoFilled /></el-icon>
              <p>数据处理算法高度依赖于用户上传文件的内容结构，故使用前请仔细查看各处理类型提供的样例文件的内容结构。</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 结果下载 -->
      <div class="content-section" ref="downloadRef" id="download">
        <h2>结果下载</h2>
        <div class="content-body">
          <div class="doc-card">
            <div class="doc-tip">
              <el-icon class="tip-icon"><Download /></el-icon>
              <p>文件在处理完成后，会渲染处理结果至页面表格。用户可以通过悬浮球中下载功能获取当前处理结果。</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 结果检索 -->
      <div class="content-section" ref="searchRef" id="search">
        <h2>结果检索</h2>
        <div class="content-body">
          <div class="doc-card">
            <div class="search-guide">
              <div class="guide-item">
                <div class="guide-icon">
                  <el-icon><Timer /></el-icon>
                </div>
                <div class="guide-content">
                  <h4>保存时间</h4>
                  <p>系统会保存处理结果7天</p>
                </div>
              </div>
              <div class="guide-item">
                <div class="guide-icon">
                  <el-icon><Key /></el-icon>
                </div>
                <div class="guide-content">
                  <h4>快捷键</h4>
                  <p>使用【s】进入搜索界面，【esc】退出搜索界面</p>
                </div>
              </div>
              <div class="guide-item">
                <div class="guide-icon">
                  <el-icon><Search /></el-icon>
                </div>
                <div class="guide-content">
                  <h4>悬浮球</h4>
                  <p>通过悬浮球中搜索功能进入搜索界面，【esc】退出搜索界面</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 气相类型 -->
      <div class="content-section" ref="gcRef" id="gc">
        <h2>气相类型</h2>
        <div class="content-body">
          <h3>目前支持的仪器型号</h3>
          <ul>
            <li>安捷伦气相-7890</li>
          </ul>

          <h3>报告文件样例</h3>
          <!-- 文件下载卡片 -->
          <div class="sample-file-card">
            <div class="file-info">
              <el-icon><Document /></el-icon>
              <span class="file-name">气相色谱样例文件 (agilent-7890.xls)</span>
            </div>
            <el-button 
              type="primary"
              size="default"
              @click="downloadSample('gc', 'agilent-7890.xls')"
            >
              <el-icon><Download /></el-icon>
              下载样例
            </el-button>
          </div>

          <h3>处理结果结构</h3>
          <p>安捷伦气相-7890处理结果结构如下：</p>
          <!-- 结果结构表格 -->
          <el-tabs v-model="gcAgilentActiveResultTab" class="result-structure-tabs">
            <el-tab-pane label="单个文件结果" name="single">
              <el-table :data="[]" border stripe header-row-class-name="header-row-style">
                <el-table-column label="segName" align="center" />
                <el-table-column label="Area" align="center" />
                <el-table-column label="PPM" align="center" />
              </el-table>
            </el-tab-pane>
            
            <el-tab-pane label="最终结果" name="final">
              <el-table :data="[]" border stripe header-row-class-name="header-row-style">
                <!-- 第一列：基本数据（一级表头） -->
                <el-table-column label="序号" width="60" />
                <el-table-column label="检测项目(segName)" width="100" />
                
                <!-- 第二列：检测结果（二级嵌套） -->
                <el-table-column label="文件1" align="center">
                  <el-table-column label="Area" align="center" />
                  <el-table-column label="PPM" align="center" />
                </el-table-column>
                <el-table-column label="文件2" align="center">
                  <el-table-column label="Area" align="center" />
                  <el-table-column label="PPM" align="center" />
                </el-table-column>
                <el-table-column label="文件3" align="center">
                  <el-table-column label="Area" align="center" />
                  <el-table-column label="PPM" align="center" />
                </el-table-column>
                <el-table-column label="..." align="center"></el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 气质类型 -->
      <div class="content-section" ref="gcmsRef" id="gcms">
        <h2>气质类型</h2>
        <div class="content-body">
          <h3>目前支持的仪器型号</h3>
          <ul>
            <li>岛津气质-2010&8050</li>
            <li>热电气质</li>
          </ul>

          <h3>报告文件样例</h3>
          <!-- 岛津气质样例文件下载卡片 -->
          <div class="sample-file-card">
            <div class="file-info">
              <el-icon><Document /></el-icon>
              <span class="file-name">岛津气质样例文件 (shimadzu-2010&8050.xlsx)</span>
            </div>
            <el-button 
              type="primary"
              size="default"
              @click="downloadSample('gcms', 'shimadzu-2010&8050.xlsx')"
            >
              <el-icon><Download /></el-icon>
              下载样例
            </el-button>
          </div>

          <!-- 热电气质样例文件下载卡片 -->
          <div class="sample-file-card">
            <div class="file-info">
              <el-icon><Document /></el-icon>
              <span class="file-name">热电气质样例文件 (thermo.xls)</span>
            </div>
            <el-button 
              type="primary"
              size="default"
              @click="downloadSample('gcms', 'thermo.xls')"
            >
              <el-icon><Download /></el-icon>
              下载样例
            </el-button>
          </div>

          <h3>处理结果结构</h3>
          <p>岛津气质-2010&8050处理结果结构如下：</p>
          <!-- 结果结构表格 -->
          <el-tabs v-model="gcmsShimadzuActiveResultTab" class="result-structure-tabs">
            <el-tab-pane label="单个文件结果" name="single">
              <el-table :data="[]" border stripe header-row-class-name="header-row-style">
                <el-table-column label="RT" align="center" />
                <el-table-column label="CompoundName" align="center" />
                <el-table-column label="SI" align="center" />
                <el-table-column label="CAS" align="center" />
                <el-table-column label="Area" align="center" />
              </el-table>
            </el-tab-pane>
            
            <el-tab-pane label="最终结果" name="final">
              <el-table :data="[
                {rt: ' ', compoundName: ' ', si: ' ', cas: ' ', file1: '此处为对应的Area检测值', file2: '', file3: '', more: ''}
              ]" border stripe header-row-class-name="header-row-style">
                <el-table-column prop="rt" label="RT" align="center" />
                <el-table-column prop="compoundName" label="CompoundName" align="center" />
                <el-table-column prop="si" label="SI" align="center" />
                <el-table-column prop="cas" label="CAS" align="center" />
                <el-table-column prop="file1" label="文件1" align="center" />
                <el-table-column prop="file2" label="文件2" align="center" />
                <el-table-column prop="file3" label="文件3" align="center" />
                <el-table-column prop="more" label="..." align="center" />
              </el-table>
            </el-tab-pane>
          </el-tabs>

          <p>热电气质处理结果结构如下：</p>
          <!-- 结果结构表格 -->
          <el-tabs v-model="gcmsThermoActiveResultTab" class="result-structure-tabs">
            <el-tab-pane label="单个文件结果" name="single">
              <el-table :data="[]" border stripe header-row-class-name="header-row-style">
                <el-table-column label="RT" align="center" />
                <el-table-column label="CompoundName" align="center" />
                <el-table-column label="CAS" align="center" />
                <el-table-column label="Molecular Formula" align="center" />
                <el-table-column label="SI" align="center" />
                <el-table-column label="RSI" align="center" />
                <el-table-column label="Area" align="center" />
              </el-table>
            </el-tab-pane>
            
            <el-tab-pane label="最终结果" name="final">
              <el-table :data="[
                {rt: ' ', compoundName: ' ', cas: ' ', molecularFormula: ' ', si: ' ', rsi: ' ', file1: '此处为对应的Area检测值', file2: '', file3: '', more: ''}
              ]" border stripe header-row-class-name="header-row-style">
                <el-table-column prop="rt" label="RT" align="center" />
                <el-table-column prop="compoundName" label="CompoundName" align="center" />
                <el-table-column prop="cas" label="CAS" align="center" />
                <el-table-column prop="molecularFormula" label="Molecular Formula" align="center" />
                <el-table-column prop="si" label="SI" align="center" />
                <el-table-column prop="rsi" label="RSI" align="center" />
                <el-table-column prop="file1" label="文件1" align="center" />
                <el-table-column prop="file2" label="文件2" align="center" />
                <el-table-column prop="file3" label="文件3" align="center" />
                <el-table-column prop="more" label="..." align="center" />
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 液相类型 -->
      <div class="content-section" ref="lcRef" id="lc">
        <h2>液相类型</h2>
        <div class="content-body">
          <h3>目前支持的仪器型号</h3>
          <ul>
            <li>安捷伦液相-1290</li>
            <li>岛津液相-LC30&LC2030</li>
          </ul>

          <h3>报告文件样例</h3>
          <!-- 安捷伦液相样例文件下载卡片 -->
          <div class="sample-file-card">
            <div class="file-info">
              <el-icon><Document /></el-icon>
              <span class="file-name">安捷伦液相样例文件 (agilent-1290.xls)</span>
            </div>
            <el-button 
              type="primary"
              size="default"
              @click="downloadSample('lc', 'agilent-1290.xls')"
            >
              <el-icon><Download /></el-icon>
              下载样例
            </el-button>
          </div>

          <!-- 岛津液相样例文件下载卡片 -->
          <div class="sample-file-card">
            <div class="file-info">
              <el-icon><Document /></el-icon>
              <span class="file-name">岛津液相样例文件 (shimadzu-lc30&2030.xlsx)</span>
            </div>
            <el-button 
              type="primary"
              size="default"
              @click="downloadSample('lc', 'shimadzu-lc30&2030.xlsx')"
            >
              <el-icon><Download /></el-icon>
              下载样例
            </el-button>
          </div>

          <h3>处理结果结构</h3>
          <p>安捷伦液相-1290处理结果结构如下：</p>
          <!-- 结果结构表格 -->
          <el-tabs v-model="lcAgilentActiveResultTab" class="result-structure-tabs">
            <el-tab-pane label="单个文件结果" name="single">
              <el-table :data="[]" border stripe header-row-class-name="header-row-style">
                <el-table-column label="RT" align="center" />
                <el-table-column label="Area" align="center" />
                </el-table>
            </el-tab-pane>
            
            <el-tab-pane label="最终结果" name="final">
              <el-table :data="[
                {rt: ' ', file1: '此处为对应的Area检测值', file2: '', file3: '', more: ''}
              ]" border stripe header-row-class-name="header-row-style">
                <el-table-column prop="rt" label="RT" align="center" />
                <el-table-column prop="file1" label="文件1" align="center" />
                <el-table-column prop="file2" label="文件2" align="center" />
                <el-table-column prop="file3" label="文件3" align="center" />
                <el-table-column prop="more" label="..." align="center" />
              </el-table>
            </el-tab-pane>
          </el-tabs>

          <p>岛津液相-LC30&LC2030处理结果结构如下：</p>
          <!-- 结果结构表格 -->
          <el-tabs v-model="lcShimadzuActiveResultTab" class="result-structure-tabs">
            <el-tab-pane label="单个文件结果" name="single">
              <el-table :data="[]" border stripe header-row-class-name="header-row-style">
                <el-table-column type="group-title" label="波长分组1" width="180" align="center">
                  <el-table-column label="序号" width="80" align="center" />
                  <el-table-column label="RT" align="center" />
                  <el-table-column label="Area" align="center" />
                </el-table-column>
              </el-table>
              <el-table :data="[]" border stripe header-row-class-name="header-row-style" style="margin-top: 20px;">
                <el-table-column type="group-title" label="波长分组2" width="180" align="center">
                  <el-table-column label="序号" width="80" align="center" />
                  <el-table-column label="RT" align="center" />
                  <el-table-column label="Area" align="center" />
                </el-table-column>
              </el-table>
              <el-table :data="[]" border stripe header-row-class-name="header-row-style" style="margin-top: 20px;">
                <el-table-column type="group-title" label="波长分组..." width="180" align="center">
                  <el-table-column label="序号" width="80" align="center" />
                  <el-table-column label="RT" align="center" />
                  <el-table-column label="Area" align="center" />
                </el-table-column>
              </el-table>
            </el-tab-pane>
            
            <el-tab-pane label="最终结果" name="final">
              <el-table :data="[
                {index: ' ', rt: ' ', file1: '此处为对应的Area检测值', file2: '', file3: '', more: ''}
              ]" border stripe header-row-class-name="header-row-style">
                <el-table-column type="group-title" label="波长分组1" width="180" align="center">
                  <el-table-column prop="index" label="序号" width="80" align="center" />
                  <el-table-column prop="rt" label="RT" align="center" />
                  <el-table-column prop="file1" label="文件1" align="center" />
                  <el-table-column prop="file2" label="文件2" align="center" />
                  <el-table-column prop="file3" label="文件3" align="center" />
                  <el-table-column prop="more" label="..." align="center" />
                </el-table-column>
              </el-table>
              <el-table :data="[
                {index: ' ', rt: ' ', file1: '此处为对应的Area检测值', file2: '', file3: '', more: ''}
              ]" border stripe header-row-class-name="header-row-style">
                <el-table-column type="group-title" label="波长分组2" width="180" align="center">
                  <el-table-column prop="index" label="序号" width="80" align="center" />
                  <el-table-column prop="rt" label="RT" align="center" />
                  <el-table-column prop="file1" label="文件1" align="center" />
                  <el-table-column prop="file2" label="文件2" align="center" />
                  <el-table-column prop="file3" label="文件3" align="center" />
                  <el-table-column prop="more" label="..." align="center" />
                </el-table-column>
              </el-table>
              <el-table :data="[
                {index: ' ', rt: ' ', file1: '此处为对应的Area检测值', file2: '', file3: '', more: ''}
              ]" border stripe header-row-class-name="header-row-style">
                <el-table-column type="group-title" label="波长分组..." width="180" align="center">
                  <el-table-column prop="index" label="序号" width="80" align="center" />
                  <el-table-column prop="rt" label="RT" align="center" />
                  <el-table-column prop="file1" label="文件1" align="center" />
                  <el-table-column prop="file2" label="文件2" align="center" />
                  <el-table-column prop="file3" label="文件3" align="center" />
                  <el-table-column prop="more" label="..." align="center" />
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 液质类型 -->
      <div class="content-section" ref="lcmsRef" id="lcms">
        <h2>液质类型</h2>
        <div class="content-body">
          <h3>目前支持的仪器型号</h3>
          <ul>
            <li>AB液质</li>
            <li>安捷伦液质-6470</li>
          </ul>

          <h3>报告文件样例</h3>
          <!-- AB液质样例文件下载卡片 -->
          <div class="sample-file-card">
            <div class="file-info">
              <el-icon><Document /></el-icon>
              <span class="file-name">AB液质样例文件 (AB.docx)</span>
            </div>
            <el-button 
              type="primary"
              size="default"
              @click="downloadSample('lcms', 'AB.docx')"
            >
              <el-icon><Download /></el-icon>
              下载样例
            </el-button>
          </div>

          <!-- 安捷伦液质样例文件下载卡片 -->
          <div class="sample-file-card">
            <div class="file-info">
              <el-icon><Document /></el-icon>
              <span class="file-name">安捷伦液质样例文件 (agilent-6470.xlsx)</span>
            </div>
            <el-button 
              type="primary"
              size="default"
              @click="downloadSample('lcms', 'agilent-6470.xlsx')"
            >
              <el-icon><Download /></el-icon>
              下载样例
            </el-button>
          </div>

          <h3>处理结果结构</h3>
          <p>AB液质处理结果结构如下：</p>
          <!-- 结果结构表格 -->
          <el-tabs v-model="lcmsAbActiveResultTab" class="result-structure-tabs">
            <el-tab-pane label="单个文件结果" name="single">
              <el-table :data="[]" border stripe header-row-class-name="header-row-style">
                <!-- 第一列：基本数据（一级表头） -->
                <el-table-column label="序号" width="60" />
                <el-table-column label="样品名称" width="100" />
                <el-table-column label="样品类型" width="100" />
                <el-table-column label="目标浓度(ng/ml)" width="100" />
                
                <!-- 第二列：检测结果（二级嵌套） -->
                <el-table-column label="化合物1（离子对）" align="center">
                  <el-table-column label="峰面积" align="center" />
                  <el-table-column label="RT" align="center" />
                  <el-table-column label="计算浓度(ng/ml)" align="center" />
                </el-table-column>
                <el-table-column label="化合物2（离子对）" align="center">
                  <el-table-column label="峰面积" align="center" />
                  <el-table-column label="RT" align="center" />
                  <el-table-column label="计算浓度(ng/ml)" align="center" />
                </el-table-column>
                <el-table-column label="..." align="center"></el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>

          <p>安捷伦液质-6470处理结果结构如下：</p>
          <!-- 结果结构表格 -->
          <el-tabs v-model="lcmsAgilentActiveResultTab" class="result-structure-tabs">
            <el-tab-pane label="单个文件结果" name="single">
              <el-table :data="[
                {dataFile: ' ', sampleType: ' ', compound1: '此处为对应的化合物浓度检测值', compound2: ' ', more: ' ', concentrationUnit: ' '}
              ]" border stripe header-row-class-name="header-row-style">
                <!-- 第一列：基本数据（一级表头） -->
                <el-table-column prop="dataFile" label="数据文件" align="center" />
                <el-table-column prop="sampleType" label="样品类型" align="center" />
                <el-table-column prop="compound1" label="化合物1" align="center" />
                <el-table-column prop="compound2" label="化合物2" align="center" />
                <el-table-column prop="more" label="..." align="center" />
                <el-table-column prop="concentrationUnit" label="浓度单位" align="center" />
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <div class="content-section" ref="contactRef" id="contact">
        <h2>联系我们</h2>
        <div class="content-body">
          <ul>
            <li>工作时间：周一至周五 9:00-18:00</li>
            <li>技术支持邮箱：281019199@qq.com</li>
          </ul>
        </div>
      </div>

    </div>

    <!-- 右侧目录导航 -->
    <div class="help-sidebar">
      <div class="outline-header">
        <span>目录大纲</span>
      </div>
      <el-scrollbar>
        <div class="outline-menu">
          <div class="outline-group">
            <div class="outline-item" 
               :class="{ active: activeMenu === 'introduction' }"
               @click="scrollToSection('introduction')">
            <div class="item-content">系统介绍</div>
          </div>

            <div class="group-title">系统功能说明</div>
            <div class="outline-item" 
                 :class="{ active: activeMenu === 'upload' }"
                 @click="scrollToSection('upload')">
              <div class="item-content">文件上传</div>
            </div>
            <div class="outline-item" 
                 :class="{ active: activeMenu === 'process' }"
                 @click="scrollToSection('process')">
              <div class="item-content">数据处理</div>
            </div>
            <div class="outline-item" 
                 :class="{ active: activeMenu === 'download' }"
                 @click="scrollToSection('download')">
              <div class="item-content">结果下载</div>
            </div>
            <div class="outline-item" 
                 :class="{ active: activeMenu === 'search' }"
                 @click="scrollToSection('search')">
              <div class="item-content">结果检索</div>
            </div>
          </div>
          
          <div class="outline-group">
            <div class="group-title">处理类型详解</div>
            <div class="outline-item" 
                 :class="{ active: activeMenu === 'gc' }"
                 @click="scrollToSection('gc')">
              <div class="item-content">气相类型</div>
            </div>
            <div class="outline-item" 
                 :class="{ active: activeMenu === 'gcms' }"
                 @click="scrollToSection('gcms')">
              <div class="item-content">气质类型</div>
            </div>
            <div class="outline-item" 
                 :class="{ active: activeMenu === 'lc' }"
                 @click="scrollToSection('lc')">
              <div class="item-content">液相类型</div>
            </div>
            <div class="outline-item" 
                 :class="{ active: activeMenu === 'lcms' }"
                 @click="scrollToSection('lcms')">
              <div class="item-content">液质类型</div>
            </div>
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
import { 
  Download, 
  Document, 
  Monitor, 
  Cpu, 
  Upload,
  InfoFilled,
  Search,
  Timer,
  Key
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeMenu = ref('introduction')
const contentRef = ref(null)
const gcAgilentActiveResultTab = ref('single')
const gcmsShimadzuActiveResultTab = ref('single')
const gcmsThermoActiveResultTab = ref('single')
const lcAgilentActiveResultTab = ref('single')
const lcShimadzuActiveResultTab = ref('single')
const lcmsAbActiveResultTab = ref('single')
const lcmsAgilentActiveResultTab = ref('single')

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
    // 获取导航栏高度（假设为60px）
    const navHeight = 60
    const elementPosition = element.offsetTop
    // 滚动到目标位置，减去导航栏高度和额外的偏移量
    contentRef.value.scrollTo({
      top: elementPosition - navHeight - 20, // 添加20px的额外偏移量
      behavior: 'smooth'
    })
    activeMenu.value = sectionId
  }
}

// 修改 handleContentScroll 函数
const handleContentScroll = () => {
  if (!contentRef.value) return

  const navHeight = 60 // 导航栏高度
  const scrollTop = contentRef.value.scrollTop
  const sections = document.querySelectorAll('.content-section')
  
  // 找到当前可见的section
  let currentSection = null
  let minDistance = Infinity

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect()
    const sectionTop = rect.top
    const distance = Math.abs(sectionTop - navHeight)
    
    // 如果section在视口中且距离顶部的距离最小
    if (distance < minDistance && sectionTop <= navHeight + 100) { // 增加一个100px的缓冲区
      minDistance = distance
      currentSection = section
    }
  })

  // 更新激活的菜单项
  if (currentSection) {
    activeMenu.value = currentSection.id
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

// 统一的文件下载函数
const downloadSample = async (type, filename) => {
  try {
    const response = await fetch(`/sample_files/${type}/${filename}`)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('样例文件下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请稍后重试')
  }
}

onMounted(() => {
  // 初始滚动到顶部
  if (contentRef.value) {
    contentRef.value.scrollTop = 0
  }

  // 使用防抖处理滚动事件
  const debouncedScroll = debounce(handleContentScroll, 100)

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
/* 添加全局字体变量 */
:root {
  --font-size-xxl: 28px;   /* 主标题 */
  --font-size-xl: 24px;    /* 二级标题 */
  --font-size-lg: 18px;    /* 三级标题 */
  --font-size-md: 16px;    /* 普通文本 */
  --font-size-sm: 14px;    /* 小号文本 */
  --font-size-xs: 12px;    /* 最小文本 */

  /* 右侧目录专用样式变量 */
  --outline-header-size: 10px;      /* 目录标题 */
  --outline-group-title-size: 9px;  /* 分组标题 */
  --outline-item-size: 9px;         /* 目录项 */
}

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
  z-index: 10; /* 确保侧边栏在内容之上 */
}

.outline-header {
  padding: 12px 16px;
  font-size: var(--outline-header-size);
  -webkit-text-size-adjust: none;  /* 禁用文字大小自动调整 */
  transform: scale(0.9);  /* 缩放文字 */
  transform-origin: left center;
  font-weight: 600;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.outline-menu {
  padding: 20px 16px;  /* 增加内边距 */
}

.outline-group {
  margin-bottom: 16px;  /* 减小组间距 */
  background-color: var(--el-fill-color-blank);
  border-radius: 8px;
  padding: 8px 6px;  /* 减小内边距 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.group-title {
  padding: 6px 12px;
  font-size: var(--outline-group-title-size);
  -webkit-text-size-adjust: none;
  transform: scale(0.9);
  transform-origin: left center;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 6px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 2px;
    height: 10px;
    background-color: var(--el-color-primary);
    border-radius: 1px;
  }
}

.outline-item {
  padding: 4px 12px;
  margin: 1px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  padding-left: 20px;

  .item-content {
    font-size: var(--outline-item-size);
    -webkit-text-size-adjust: none;
    transform: scale(0.9);
    transform-origin: left center;
    color: var(--el-text-color-regular);
    transition: all 0.3s;
  }

  &::before {
    content: '';
    position: absolute;
    left: 10px;  /* 调整标记位置 */
    top: 50%;
    transform: translateY(-50%);
    width: 2px;  /* 减小标记宽度 */
    height: 2px;  /* 减小标记高度 */
    border-radius: 50%;
    background-color: var(--el-color-primary);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    background-color: var(--el-color-primary-light-9);
    transform: translateX(4px);
    
    .item-content {
      color: var(--el-color-primary);
    }
  }

  &.active {
    background-color: var(--el-color-primary-light-8);
    
    .item-content {
      color: var(--el-color-primary);
      font-weight: 500;
    }

    &::before {
      opacity: 1;
    }
  }
}

/* 调整目录组的间距 */
.outline-group {
  margin-bottom: 16px;  /* 减小组间距 */
  background-color: var(--el-fill-color-blank);
  border-radius: 8px;
  padding: 8px 6px;  /* 减小内边距 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 调整非分组目录项的样式 */
.outline-menu > .outline-item {
  margin: 6px 0;  /* 减小外边距 */
  background-color: var(--el-fill-color-blank);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 内容区样式 */
.content-section {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px 0;
  scroll-margin-top: 60px;

  h2 {
    font-size: var(--font-size-xxl);
    font-weight: 600;
    margin-bottom: 24px;
    padding: 16px 20px;
    color: var(--el-text-color-primary);
    background-color: var(--el-color-primary-light-9);
    border-radius: 8px;
    position: relative;
    
    /* 左侧装饰条 */
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      background-color: var(--el-color-primary);
      border-radius: 2px;
    }
  }

  h3 {
    font-size: var(--font-size-xl);
    font-weight: 500;
    margin: 28px 0 20px;  /* 增加上下间距 */
    padding: 12px 0;
    color: var(--el-text-color-primary);
    position: relative;
    border-bottom: 2px solid var(--el-border-color-light);  /* 添加底部边框 */

    /* 左侧装饰 */
    &::before {
      content: '';
      position: absolute;
      left: 0;
      bottom: -2px;  /* 与底部边框对齐 */
      width: 50px;  /* 装饰线宽度 */
      height: 2px;
      background-color: var(--el-color-primary);
    }
  }

  .content-body {
    color: var(--el-text-color-regular);
    line-height: 1.8;
    padding: 0 16px;

    h4 {
      font-size: var(--font-size-lg);
      font-weight: 500;
      margin: 0 0 8px;
      color: var(--el-text-color-primary);
    }

    p {
      font-size: var(--font-size-md);
      margin: 0 0 16px;
    }
  }

  /* 特殊处理系统介绍部分的卡片标题 */
  .intro-card, .instruments-card, .process-card {
    .card-title {
      font-size: var(--font-size-xl);
      font-weight: 500;
      margin-bottom: 24px;
      padding-left: 16px;
      color: var(--el-text-color-primary);
      position: relative;
      border-bottom: none;  /* 移除底部边框 */

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 20px;
        background-color: var(--el-color-primary);
        border-radius: 2px;
      }
    }
  }

  /* 处理流程标题样式 */
  .process-steps {
    .step-content {
      h4 {
        font-size: var(--font-size-lg);
        font-weight: 500;
        margin: 0 0 8px;
        color: var(--el-text-color-primary);
      }
    }
  }
}

/* 深色模式适配 */
:deep(.dark) {
  .content-section {
    h2 {
      background-color: var(--el-color-primary-light-5);
      color: var(--el-color-white);
    }

    h3 {
      border-bottom-color: var(--el-border-color-darker);
    }
  }
}

/* 响应式布局调整 */
@media screen and (max-width: 1400px) {
  .content-section {
    max-width: 1000px;
  }
}

@media screen and (max-width: 1200px) {
  .content-section {
    max-width: 800px;
  }
}

@media screen and (max-width: 768px) {
  .help-content {
    margin-right: 0;
    padding: 16px;
  }

  .help-sidebar {
    transform: translateX(100%);
    transition: transform 0.3s ease;
    
    &.show {
      transform: translateX(0);
    }
  }

  .content-section {
    max-width: 100%;
    padding: 16px 0;
  }

  /* 添加一个移动端的目录切换按钮 */
  .mobile-menu-toggle {
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 11;
    display: block;
  }

  /* 响应式字体调整 - 内容区 */
  :root {
    --font-size-xxl: 24px;
    --font-size-xl: 20px;
    --font-size-lg: 16px;
    --font-size-md: 14px;
    --font-size-sm: 12px;
    --font-size-xs: 12px;

    /* 响应式字体调整 - 目录区 */
    --outline-header-size: 9px;
    --outline-group-title-size: 8px;
    --outline-item-size: 8px;
  }
}

/* 样例文件下载卡片在不同屏幕尺寸下的样式 */
.sample-file-card {
  @media screen and (max-width: 576px) {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    
    .file-info {
      width: 100%;
    }
    
    .el-button {
      width: 100%;
      justify-content: center;
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

/* 深色模式适配 */
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

/* 按钮样式 */
.el-button {
  margin: 15px 0;
}

/* 表格样式 */
.el-table {
  margin: 15px 0;
}

/* 确保表格在小屏幕上也能正常显示 */
@media screen and (max-width: 768px) {
  .el-table {
    width: 100%;
    overflow-x: auto;
  }
}

/* 样例文件下载卡片样式 */
.sample-file-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: var(--el-bg-color-page);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  margin: 16px 0;
  transition: all 0.3s ease;
}

.sample-file-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-info .el-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.file-name {
  font-size: var(--font-size-md);
  color: var(--el-text-color-primary);
}

.sample-file-card .el-button {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 深色模式适配 */
:deep(.dark) .sample-file-card {
  background-color: var(--el-bg-color-overlay);
  border-color: var(--el-border-color-darker);
}

/* 结果结构表格样式 */
.result-structure-tabs {
  margin: 20px 0;
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-table) {
  margin-bottom: 0;
}

:deep(.el-table th) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 600;
}

:deep(.el-table td) {
  color: var(--el-text-color-regular);
}

/* 深色模式适配 */
:deep(.dark) {
  .el-table th {
    background-color: var(--el-color-primary-light-5);
  }
}

/* 表格头部样式 */
:deep(.header-row-style) {
  background-color: var(--el-fill-color-dark) !important;
}

:deep(.el-table__header) th {
  background-color: var(--el-fill-color-dark) !important;
  color: var(--el-text-color-primary);
}

/* 深色模式适配 */
:deep(.dark) {
  .header-row-style,
  .el-table__header th {
    background-color: var(--el-bg-color-overlay) !important;
  }
}

/* 表格分组样式 */
.table-group {
  margin-bottom: 20px;
}

.table-group .group-title {
  padding: 10px;
  font-weight: bold;
  background-color: var(--el-color-primary-light-8);
  border: 1px solid var(--el-border-color-light);
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}

/* 深色模式适配 */
:deep(.dark) .table-group .group-title {
  background-color: var(--el-color-primary-light-5);
  color: var(--el-color-white);
}

/* 系统介绍部分的样式 */
.intro-card {
  background: var(--el-bg-color-overlay);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.intro-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.intro-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.intro-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.intro-description {
  font-size: 16px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

.instruments-card {
  background: var(--el-bg-color-overlay);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: var(--font-size-xl);
  font-weight: 500;
  margin-bottom: 24px;
  padding-left: 16px;
  color: var(--el-text-color-primary);
  position: relative;
  border-bottom: none;  /* 移除底部边框 */

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    background-color: var(--el-color-primary);
    border-radius: 2px;
  }
}

.instruments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.instrument-type {
  background: var(--el-fill-color-blank);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.instrument-type:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.type-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.type-header .el-icon {
  color: var(--el-color-primary);
}

.type-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.type-list li {
  padding: 8px 0;
  padding-left: 20px;
  position: relative;
  color: var(--el-text-color-regular);
}

.type-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-color-primary-light-5);
}

.process-card {
  background: var(--el-bg-color-overlay);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.process-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--el-fill-color-blank);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.step:hover {
  transform: translateX(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin: 0 0 8px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.step-content p {
  margin: 0;
  color: var(--el-text-color-regular);
}

/* 深色模式适配 */
:deep(.dark) {
  .intro-card,
  .instruments-card,
  .process-card {
    background: var(--el-bg-color);
  }

  .instrument-type,
  .step {
    background: var(--el-bg-color-overlay);
  }

  .type-list li::before {
    background: var(--el-color-primary);
  }
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .instruments-grid {
    grid-template-columns: 1fr;
  }

  .step {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px;
  }

  .step-number {
    margin-bottom: 8px;
  }
}

/* 文档卡片基础样式 */
.doc-card {
  background: var(--el-bg-color-overlay);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.doc-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
}

.doc-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.card-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

/* 文档表格样式 */
.doc-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}

.doc-table th {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 600;
  padding: 16px;
  text-align: left;
}

.doc-table td {
  padding: 14px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-regular);
}

.doc-table tr:hover td {
  background: var(--el-fill-color-light);
}

/* 提示框样式 */
.doc-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: var(--el-color-warning-light-9);
  border-radius: 8px;
  border-left: 4px solid var(--el-color-warning);
}

.notice-icon {
  color: var(--el-color-warning);
  font-size: 20px;
  margin-top: 2px;
}

.doc-notice p {
  margin: 0;
  color: var(--el-color-warning-darker);
  line-height: 1.6;
}

.doc-tip {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: var(--el-color-success-light-9);
  border-radius: 8px;
  border-left: 4px solid var(--el-color-success);
}

.tip-icon {
  color: var(--el-color-success);
  font-size: 20px;
  margin-top: 2px;
}

.doc-tip p {
  margin: 0;
  color: var(--el-color-success-darker);
  line-height: 1.6;
}

/* 搜索指南样式 */
.search-guide {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.guide-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--el-fill-color-blank);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.guide-item:hover {
  background: var(--el-color-primary-light-9);
  transform: translateY(-2px);
}

.guide-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

.guide-icon .el-icon {
  font-size: 20px;
}

.guide-content {
  flex: 1;
}

.guide-content h4 {
  margin: 0 0 8px;
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.guide-content p {
  margin: 0;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

/* 深色模式适配 */
:deep(.dark) {
  .doc-card {
    background: var(--el-bg-color);
  }

  .doc-table th {
    background-color: var(--el-color-primary-light-5);
  }

  .doc-notice {
    background: var(--el-color-warning-light-5);
    border-left-color: var(--el-color-warning);
  }

  .doc-tip {
    background: var(--el-color-success-light-5);
    border-left-color: var(--el-color-success);
  }

  .guide-item {
    background: var(--el-bg-color-overlay);
  }

  .guide-item:hover {
    background: var(--el-color-primary-light-5);
  }

  .guide-icon {
    background: var(--el-color-primary-light-3);
  }
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .doc-card {
    padding: 16px;
  }

  .doc-table {
    display: block;
    overflow-x: auto;
  }

  .search-guide {
    grid-template-columns: 1fr;
  }

  .guide-item {
    padding: 16px;
  }
}

/* 添加悬浮效果 */
.instrument-type:hover {
  background: var(--el-color-primary-light-9) !important;
  transform: translateY(-2px);
}

.step:hover {
  background: var(--el-color-primary-light-9) !important;
  transform: translateX(8px);
}

:deep(.dark) {
  .instrument-type:hover,
  .step:hover {
    background: var(--el-color-primary-light-5) !important;
  }
}
</style> 