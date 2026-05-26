package com.raksh.alert.ui.safety

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.raksh.alert.ui.theme.EmergencyRed
import com.raksh.alert.ui.theme.Slate100
import com.raksh.alert.ui.theme.Slate400
import com.raksh.alert.ui.theme.Slate700
import com.raksh.alert.ui.theme.Slate800
import com.raksh.alert.ui.theme.Slate900
import com.raksh.alert.ui.theme.Slate950

@Composable
fun SafetyGuideScreen(
    onBack: () -> Unit,
    viewModel: SafetyGuideViewModel = hiltViewModel()
) {
    val language by viewModel.selectedLanguage.collectAsState(initial = "English")
    val guides = viewModel.getGuides(language)

    var activeGuide by remember { mutableStateOf<SafetyGuide?>(null) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate950)
            .padding(top = 16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = {
                    if (activeGuide != null) {
                        activeGuide = null
                    } else {
                        onBack()
                    }
                }) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = Slate100
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (activeGuide != null) activeGuide!!.title else if (language.lowercase() == "hindi") "सुरक्षा मार्गदर्शिका" else "Safety Guidelines",
                    color = Slate100,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (activeGuide == null) {
                // List of Safety Guides
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                ) {
                    Text(
                        text = if (language.lowercase() == "hindi") "एक आपदा प्रकार चुनें" else "Select a disaster category",
                        color = Slate400,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )

                    guides.forEach { guide ->
                        SafetyCategoryCard(
                            guide = guide,
                            onClick = { activeGuide = guide }
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }
            } else {
                // Detailed Guide View with Tabs
                DetailedGuideView(guide = activeGuide!!, language = language)
            }
        }
    }
}

@Composable
fun SafetyCategoryCard(
    guide: SafetyGuide,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Slate900,
            contentColor = Slate100
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = guide.title,
                color = Slate100,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = guide.description,
                color = Slate400,
                fontSize = 14.sp,
                lineHeight = 20.sp
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "View Action Plan →",
                color = EmergencyRed,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun DetailedGuideView(guide: SafetyGuide, language: String) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabTitles = if (language.lowercase() == "hindi") {
        listOf("आपदा से पहले", "आपदा के दौरान", "आपदा के बाद")
    } else {
        listOf("Before", "During", "After")
    }

    Column(modifier = Modifier.fillMaxSize()) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(
                containerColor = Slate900,
                contentColor = Slate100
            )
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = guide.description,
                    color = Slate400,
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Tab Row
        TabRow(
            selectedTabIndex = selectedTab,
            containerColor = Color.Transparent,
            contentColor = Slate400,
            indicator = { tabPositions ->
                TabRowDefaults.Indicator(
                    modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                    color = EmergencyRed,
                    height = 3.dp
                )
            },
            divider = {}
        ) {
            tabTitles.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = {
                        Text(
                            text = title,
                            fontSize = 14.sp,
                            fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Medium,
                            color = if (selectedTab == index) Slate100 else Slate400
                        )
                    }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        val steps = when (selectedTab) {
            0 -> guide.beforeSteps
            1 -> guide.duringSteps
            else -> guide.afterSteps
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            steps.forEachIndexed { index, step ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
                        .background(Slate900, RoundedCornerShape(8.dp))
                        .border(1.dp, Slate800, RoundedCornerShape(8.dp))
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .background(EmergencyRed.copy(alpha = 0.1f), RoundedCornerShape(100.dp))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "${index + 1}",
                            color = EmergencyRed,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Text(
                        text = step,
                        color = Slate100,
                        fontSize = 14.sp,
                        lineHeight = 20.sp,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}