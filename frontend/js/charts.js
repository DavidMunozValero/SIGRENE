const CHART_COLORS = {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#06b6d4'
};

const CHART_LAYOUT = {
    font: {
        family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { t: 30, r: 30, b: 50, l: 60 }
};

function createLineChart(containerId, title, xData, yData, yAxisLabel, color = CHART_COLORS.primary) {
    const trace = {
        x: xData,
        y: yData,
        type: 'scatter',
        mode: 'lines+markers',
        name: yAxisLabel,
        line: {
            color: color,
            width: 2
        },
        marker: {
            size: 6,
            color: color
        }
    };

    const layout = {
        ...CHART_LAYOUT,
        title: {
            text: title,
            font: { size: 14, weight: '600' }
        },
        xaxis: {
            title: 'Fecha',
            showgrid: true,
            gridcolor: '#e2e8f0'
        },
        yaxis: {
            title: yAxisLabel,
            showgrid: true,
            gridcolor: '#e2e8f0'
        }
    };

    Plotly.newPlot(containerId, [trace], layout, {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    });
}

function createBarChart(containerId, title, xData, yData, yAxisLabel, color = CHART_COLORS.primary) {
    const trace = {
        x: xData,
        y: yData,
        type: 'bar',
        name: yAxisLabel,
        marker: {
            color: color
        }
    };

    const layout = {
        ...CHART_LAYOUT,
        title: {
            text: title,
            font: { size: 14, weight: '600' }
        },
        xaxis: {
            title: 'Fecha',
            showgrid: false
        },
        yaxis: {
            title: yAxisLabel,
            showgrid: true,
            gridcolor: '#e2e8f0'
        }
    };

    Plotly.newPlot(containerId, [trace], layout, {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    });
}

function createMultiLineChart(containerId, title, data, traces) {
    const plotTraces = traces.map((trace, index) => ({
        x: data,
        y: trace.values,
        type: 'scatter',
        mode: 'lines+markers',
        name: trace.name,
        yaxis: trace.yaxis || 'y',
        line: {
            color: trace.color || Object.values(CHART_COLORS)[index % 6],
            width: 2
        },
        marker: {
            size: 6
        }
    }));

    const layout = {
        ...CHART_LAYOUT,
        title: {
            text: title,
            font: { size: 14, weight: '600' }
        },
        xaxis: {
            title: 'Fecha',
            showgrid: true,
            gridcolor: '#e2e8f0'
        },
        yaxis: {
            title: traces[0].yaxisLabel || '',
            showgrid: true,
            gridcolor: '#e2e8f0'
        }
    };

    if (traces.length > 1) {
        layout.yaxis2 = {
            title: traces[1].yaxisLabel || '',
            overlaying: 'y',
            side: 'right',
            showgrid: false
        };
    }

    Plotly.newPlot(containerId, plotTraces, layout, {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    });
}

function createVolumeChart(containerId, title, registros) {
    const sortedRegistros = [...registros].sort((a, b) => 
        new Date(a.fecha) - new Date(b.fecha)
    );

    const xData = sortedRegistros.map(r => formatDate(r.fecha));
    const yData = sortedRegistros.map(r => 
        r.sesion_entrenamiento?.volumen_metros || 0
    );

    createBarChart(containerId, title, xData, yData, 'Metros');
}

function createRPETimeChart(containerId, title, registros) {
    const sortedRegistros = [...registros].sort((a, b) => 
        new Date(a.fecha) - new Date(b.fecha)
    );

    const xData = sortedRegistros.map(r => formatDate(r.fecha));
    const rpeData = sortedRegistros.map(r => 
        r.sesion_entrenamiento?.rpe || 0
    );
    const durationData = sortedRegistros.map(r => 
        r.sesion_entrenamiento?.tiempo_sesion_minutos || 0
    );

    createMultiLineChart(containerId, title, xData, [
        { name: 'RPE', values: rpeData, color: CHART_COLORS.warning, yaxisLabel: 'RPE (1-10)' },
        { name: 'Duración (min)', values: durationData, color: CHART_COLORS.info, yaxisLabel: 'Minutos' }
    ]);
}

function createWellnessChart(containerId, title, registros) {
    const sortedRegistros = [...registros].sort((a, b) => 
        new Date(a.fecha) - new Date(b.fecha)
    );

    const registrosConManana = sortedRegistros.filter(r => r.registro_manana);
    
    if (registrosConManana.length === 0) {
        document.getElementById(containerId).innerHTML = 
            '<p class="text-center" style="color: var(--text-secondary); padding: 2rem;">No hay datos de bienestar disponibles</p>';
        return;
    }

    const xData = registrosConManana.map(r => formatDate(r.fecha));
    
    createMultiLineChart(containerId, title, xData, [
        { name: 'FC Reposo (ppm)', values: registrosConManana.map(r => r.registro_manana?.fc_reposo_ppm), color: CHART_COLORS.danger, yaxisLabel: 'FC (ppm)' },
        { name: 'Horas Sueño', values: registrosConManana.map(r => r.registro_manana?.horas_sueno), color: CHART_COLORS.info, yaxisLabel: 'Horas' }
    ]);
}

function createMetricsChart(containerId, title, registros) {
    const sortedRegistros = [...registros].sort((a, b) => 
        new Date(a.fecha) - new Date(b.fecha)
    );

    const registrosConMetricas = sortedRegistros.filter(r => 
        r.sesion_entrenamiento?.densidad || r.sesion_entrenamiento?.srpe
    );
    
    if (registrosConMetricas.length === 0) {
        document.getElementById(containerId).innerHTML = 
            '<p class="text-center" style="color: var(--text-secondary); padding: 2rem;">No hay métricas calculadas disponibles</p>';
        return;
    }

    const xData = registrosConMetricas.map(r => formatDate(r.fecha));
    
    createMultiLineChart(containerId, title, xData, [
        { name: 'Densidad (m/min)', values: registrosConMetricas.map(r => r.sesion_entrenamiento?.densidad), color: CHART_COLORS.success, yaxisLabel: 'Densidad' },
        { name: 'sRPE', values: registrosConMetricas.map(r => r.sesion_entrenamiento?.srpe), color: CHART_COLORS.warning, yaxisLabel: 'sRPE' }
    ]);
}

function updateChart(containerId, chartFunction, ...args) {
    const container = document.getElementById(containerId);
    if (container) {
        Plotly.purge(container);
        chartFunction(containerId, ...args);
    }
}

function createRadarChart(containerId, title, estilosData) {
    const labels = ['Libre', 'Espalda', 'Braza', 'Mariposa', 'Combinado'];
    const keys = ['libre', 'espalda', 'braza', 'mariposa', 'combinado'];
    
    let values = keys.map(key => estilosData[key] || 0);
    const maxValue = Math.max(...values, 1);
    values = values.map(v => v / maxValue * 100);

    const trace = {
        type: 'scatterpolar',
        r: values,
        theta: labels,
        fill: 'toself',
        name: 'Distribución',
        line: {
            color: CHART_COLORS.primary,
            width: 2
        },
        fillcolor: 'rgba(37, 99, 235, 0.3)',
        marker: {
            size: 8,
            color: CHART_COLORS.primary
        }
    };

    const layout = {
        ...CHART_LAYOUT,
        title: {
            text: title,
            font: { size: 14, weight: '600' }
        },
        polar: {
            radialaxis: {
                visible: true,
                range: [0, 100],
                ticksuffix: '%'
            }
        },
        showlegend: false
    };

    Plotly.newPlot(containerId, [trace], layout, {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    });
}

function createStylesBarChart(containerId, title, estilosData) {
    const labels = ['Libre', 'Espalda', 'Braza', 'Mariposa', 'Combinado', 'Otros'];
    const keys = ['libre', 'espalda', 'braza', 'mariposa', 'combinado', 'otros'];
    const values = keys.map(key => estilosData[key] || 0);
    const colors = [CHART_COLORS.primary, CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.danger, CHART_COLORS.info, CHART_COLORS.secondary];

    const trace = {
        type: 'bar',
        x: labels,
        y: values,
        marker: {
            color: colors
        },
        text: values.map(v => v.toLocaleString() + ' m'),
        textposition: 'outside',
        textfont: {
            size: 11
        }
    };

    const layout = {
        ...CHART_LAYOUT,
        title: {
            text: title,
            font: { size: 14, weight: '600' }
        },
        xaxis: {
            title: 'Estilo',
            showgrid: false
        },
        yaxis: {
            title: 'Metros',
            showgrid: true,
            gridcolor: '#e2e8f0'
        },
        showlegend: false
    };

    Plotly.newPlot(containerId, [trace], layout, {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    });
}

function createVolumeTrendChart(containerId, title, volumenPorDia) {
    if (!volumenPorDia || volumenPorDia.length === 0) {
        document.getElementById(containerId).innerHTML = 
            '<p class="text-center" style="color: var(--text-secondary); padding: 2rem;">No hay datos de volumen disponibles</p>';
        return;
    }

    const sortedData = [...volumenPorDia].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const xData = sortedData.map(d => formatDate(d.fecha));
    const yData = sortedData.map(d => d.volumen);

    const trace = {
        x: xData,
        y: yData,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Volumen',
        line: {
            color: CHART_COLORS.primary,
            width: 3
        },
        fill: 'tozeroy',
        fillcolor: 'rgba(37, 99, 235, 0.2)',
        marker: {
            size: 8,
            color: CHART_COLORS.primary
        }
    };

    const layout = {
        ...CHART_LAYOUT,
        title: {
            text: title,
            font: { size: 14, weight: '600' }
        },
        xaxis: {
            title: 'Fecha',
            showgrid: true,
            gridcolor: '#e2e8f0'
        },
        yaxis: {
            title: 'Metros',
            showgrid: true,
            gridcolor: '#e2e8f0'
        }
    };

    Plotly.newPlot(containerId, [trace], layout, {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    });
}

function renderActivityCalendar(containerId, actividadMensual, year, month) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const actividadMap = {};
    if (actividadMensual) {
        actividadMensual.forEach(item => {
            actividadMap[item.fecha] = item;
        });
    }

    const date = new Date(year, month, 1);
    const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const firstDay = date.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    let html = `
        <div class="calendar-header">
            <h3 class="mb-2">${monthName}</h3>
        </div>
        <div class="calendar-grid">
    `;
    
    dayNames.forEach(day => {
        html += `<div class="calendar-day-header">${day}</div>`;
    });
    
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const actividad = actividadMap[dateStr];
        const sesiones = actividad?.sesiones || 0;
        const volumen = actividad?.volumen || 0;
        
        let levelClass = 'level-0';
        if (sesiones === 1) levelClass = 'level-1';
        else if (sesiones === 2) levelClass = 'level-2';
        else if (sesiones === 3) levelClass = 'level-3';
        else if (sesiones >= 4) levelClass = 'level-4';
        
        const tooltip = sesiones > 0 ? `${sesiones} sesión${sesiones > 1 ? 'es' : ''} - ${volumen.toLocaleString()}m` : 'Sin actividad';
        
        html += `<div class="calendar-day ${levelClass}" title="${tooltip}">${day}</div>`;
    }
    
    html += `
        </div>
        <div class="calendar-legend mt-2">
            <span class="legend-label">Menos</span>
            <div class="legend-item level-0"></div>
            <div class="legend-item level-1"></div>
            <div class="legend-item level-2"></div>
            <div class="legend-item level-3"></div>
            <div class="legend-item level-4"></div>
            <span class="legend-label">Más</span>
        </div>
    `;
    
    container.innerHTML = html;
}

function createSessionDurationChart(containerId, title, registros) {
    const sortedRegistros = [...registros].sort((a, b) => 
        new Date(a.fecha) - new Date(b.fecha)
    );

    if (sortedRegistros.length === 0) {
        document.getElementById(containerId).innerHTML = 
            '<p class="text-center" style="color: var(--text-secondary); padding: 2rem;">No hay datos disponibles</p>';
        return;
    }

    const xData = sortedRegistros.map(r => formatDate(r.fecha));
    const sesiones = sortedRegistros.filter(r => r.sesion_entrenamiento);
    const volumen = sesiones.map(r => r.sesion_entrenamiento?.volumen_metros || 0);

    const trace = {
        type: 'bar',
        x: xData,
        y: volumen,
        name: 'Volumen',
        marker: {
            color: volumen.map(v => {
                if (v >= 6000) return CHART_COLORS.success;
                if (v >= 4000) return CHART_COLORS.primary;
                if (v >= 2000) return CHART_COLORS.warning;
                return CHART_COLORS.secondary;
            })
        },
        text: volumen.map(v => v.toLocaleString() + 'm'),
        textposition: 'outside'
    };

    const layout = {
        ...CHART_LAYOUT,
        title: {
            text: title,
            font: { size: 14, weight: '600' }
        },
        xaxis: {
            title: 'Fecha',
            showgrid: false
        },
        yaxis: {
            title: 'Metros',
            showgrid: true,
            gridcolor: '#e2e8f0'
        },
        showlegend: false
    };

    Plotly.newPlot(containerId, [trace], layout, {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    });
}
