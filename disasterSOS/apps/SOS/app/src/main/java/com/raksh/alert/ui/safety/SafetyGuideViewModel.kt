package com.raksh.alert.ui.safety

import androidx.lifecycle.ViewModel
import com.raksh.alert.data.local.datastore.UserPreferences
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

data class SafetyGuide(
    val title: String,
    val description: String,
    val type: String,
    val beforeSteps: List<String>,
    val duringSteps: List<String>,
    val afterSteps: List<String>
)

@HiltViewModel
class SafetyGuideViewModel @Inject constructor(
    private val userPrefs: UserPreferences
) : ViewModel() {

    val selectedLanguage: Flow<String> = userPrefs.userFlow.map { it?.language ?: "English" }

    fun getGuides(language: String): List<SafetyGuide> {
        val isHindi = language.equals("Hindi", ignoreCase = true)
        return listOf(
            SafetyGuide(
                title = if (isHindi) "बाढ़ सुरक्षा मार्गदर्शिका" else "Flood Safety Guide",
                description = if (isHindi) "बाढ़ आने से पहले, उसके दौरान और बाद में जीवन और स्वास्थ्य की रक्षा के उपाय।" else "Essential guidelines to protect lives and stay safe before, during, and after flood disasters.",
                type = "flood",
                beforeSteps = if (isHindi) listOf(
                    "आपातकालीन किट तैयार करें (भोजन, पानी, दवाएं, टॉर्च)।",
                    "महत्वपूर्ण दस्तावेजों को वाटरप्रूफ बैग में रखें।",
                    "ऊंचे स्थानों और सुरक्षित आश्रयों की पहचान करें।"
                ) else listOf(
                    "Prepare an emergency kit (food, clean water, first aid, flashlight).",
                    "Keep key documents in waterproof protective bags.",
                    "Identify elevated terrains and nearby safe community relief centers."
                ),
                duringSteps = if (isHindi) listOf(
                    "बिजली के मुख्य स्विच को तुरंत बंद कर दें।",
                    "यदि सुरक्षित हो, तो तुरंत ऊंचे स्थानों पर चले जाएं।",
                    "बहते पानी में पैर न रखें या गाड़ी चलाने का प्रयास न करें।"
                ) else listOf(
                    "Turn off primary home electrical switches immediately.",
                    "Evacuate and move to elevated safety points immediately.",
                    "Never walk or drive through rapidly moving floodwaters."
                ),
                afterSteps = if (isHindi) listOf(
                    "अधिकारियों की पुष्टि के बाद ही घर लौटें।",
                    "बिजली के उपकरणों को इस्तेमाल करने से पहले सुखाएं।",
                    "दूषित पानी और खाद्य पदार्थों के सेवन से बचें।"
                ) else listOf(
                    "Return to residential zones only after emergency authorities declare it safe.",
                    "Dry electrical appliances fully before turning them back on.",
                    "Avoid consuming potentially contaminated water or food resources."
                )
            ),
            SafetyGuide(
                title = if (isHindi) "भूकंप सुरक्षा मार्गदर्शिका" else "Earthquake Safety Guide",
                description = if (isHindi) "भूकंप के झटके महसूस होने पर खुद को और दूसरों को सुरक्षित रखने के उपाय।" else "Drop, Cover, and Hold on rules to preserve safety during tremors and secondary shocks.",
                type = "earthquake",
                beforeSteps = if (isHindi) listOf(
                    "घर में भारी वस्तुओं को सुरक्षित रूप से बांध कर रखें।",
                    "एक सुरक्षित बाहरी निकासी योजना तैयार करें।"
                ) else listOf(
                    "Secure heavy home furniture, cabinets, and appliances to walls.",
                    "Formulate a family safety evacuation and exit action plan."
                ),
                duringSteps = if (isHindi) listOf(
                    "झुकें, ढकें और पकड़ें (Drop, Cover, Hold on)।",
                    "खिड़कियों, कांच और गिरने वाली वस्तुओं से दूर रहें।"
                ) else listOf(
                    "Drop, Cover, and Hold on! Seek shelter under heavy tables or desks.",
                    "Stay clear of glass panes, window panes, and unsecured shelves."
                ),
                afterSteps = if (isHindi) listOf(
                    "गैस लीक और आग की जांच करें, लिफ्ट का उपयोग न करें।",
                    "आफ्टरशॉक्स (भूकंप के बाद के झटके) के लिए तैयार रहें।"
                ) else listOf(
                    "Check for cooking gas leaks, fire risks, and structural damage.",
                    "Avoid elevators and expect sudden aftershocks."
                )
            )
        )
    }
}