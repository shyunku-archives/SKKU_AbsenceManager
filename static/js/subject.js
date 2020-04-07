function showSummaryChart(attendanceInfo){
    const attendance = 4;
    const absence = 6;
    const unknown = 16;

    const summaryChartElem = $('#summary_chart');
    let summaryChart = new Chart(summaryChartElem, {
        type: 'doughnut',
        data:{
            labels: ['수업 참여', '참여했는지 모름', '수업 불참'],
            datasets: [{
                data: [attendance, unknown, absence],
                backgroundColor: [
                    'rgb(0, 255, 0)',
                    'rgb(255, 255, 0)',
                    'rgb(255, 0, 0)',
                ],
                borderWidth: 0,
            }],
        },
        options: {
            legend:{
                display: false,
            },
            maintainAspectRatio: false,
            cutoutPercentage: 75,
            animation: {
                easing: 'easeInOutCirc',
            }
        }
    });
}