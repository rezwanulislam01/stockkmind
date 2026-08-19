import React, { useState } from 'react';
import { X, Copy, Check, Code2, Download, Smartphone, Terminal } from 'lucide-react';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ isOpen, onClose }) => {
  const [activeFile, setActiveFile] = useState<'MainActivity.kt' | 'StockMindViewModel.kt' | 'build.gradle.kts' | 'AndroidManifest.xml'>('MainActivity.kt');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const codeSnippets: Record<string, string> = {
    'MainActivity.kt': `package com.stockmind.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.stockmind.app.ui.theme.StockMindTheme
import com.stockmind.app.ui.components.StockMindBottomNav
import com.stockmind.app.ui.screens.DashboardScreen
import com.stockmind.app.ui.screens.ForecastingScreen
import com.stockmind.app.ui.screens.SuppliersScreen
import com.stockmind.app.ui.screens.AICopilotSheet

class MainActivity : ComponentActivity() {
    private val viewModel: StockMindViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            StockMindTheme {
                val state by viewModel.uiState.collectAsState()
                var currentTab by remember { mutableStateOf("home") }

                Scaffold(
                    bottomBar = {
                        StockMindBottomNav(
                            currentTab = currentTab,
                            onTabSelected = { currentTab = it }
                        )
                    },
                    floatingActionButton = {
                        FloatingActionButton(
                            onClick = { viewModel.openRecordSaleDialog() },
                            containerColor = Color(0xFF10B981)
                        ) {
                            Icon(Icons.Default.TrendingUp, contentDescription = "Record Sale")
                        }
                    }
                ) { innerPadding ->
                    Box(modifier = Modifier.padding(innerPadding)) {
                        when (currentTab) {
                            "home" -> DashboardScreen(state = state, viewModel = viewModel)
                            "forecast" -> ForecastingScreen(state = state)
                            "suppliers" -> SuppliersScreen(state = state)
                        }
                    }
                }
            }
        }
    }
}`,

    'StockMindViewModel.kt': `package com.stockmind.app

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlin.math.roundToInt
import kotlin.math.sqrt

data class Product(
    val id: String,
    val sku: String,
    val name: String,
    val currentStock: Int,
    val dailyDemand: Double,
    val leadTimeDays: Int,
    val safetyStock: Int,
    val riskScore: Int,
    val eoq: Int,
    val unitPrice: Double
)

data class StockMindUiState(
    val products: List<Product> = emptyList(),
    val healthScore: Int = 82,
    val totalValuation: Double = 42800.0,
    val deadCapital: Double = 6970.0,
    val isLoading: Boolean = false
)

class StockMindViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(StockMindUiState())
    val uiState: StateFlow<StockMindUiState> = _uiState.asStateFlow()

    init {
        loadInventory()
    }

    // Deterministic EOQ Calculation: sqrt((2 * Demand * SetupCost) / HoldingCost)
    fun calculateEOQ(annualDemand: Double, orderCost: Double, unitCost: Double, holdingRate: Double = 0.2): Int {
        val holdingCost = unitCost * holdingRate
        return sqrt((2 * annualDemand * orderCost) / holdingCost).roundToInt()
    }

    // Dynamic Risk Score (0-100)
    fun calculateRiskScore(currentStock: Int, dailyDemand: Double, leadTimeDays: Int, safetyStock: Int): Int {
        val daysToStockout = currentStock / maxOf(0.1, dailyDemand)
        val bufferRatio = currentStock.toDouble() / maxOf(1, safetyStock)
        return when {
            daysToStockout <= leadTimeDays -> 88
            daysToStockout <= leadTimeDays * 1.5 -> 65
            bufferRatio < 1.0 -> 50
            else -> 15
        }
    }

    fun recordSale(productId: String, quantity: Int) {
        viewModelScope.launch {
            val updated = _uiState.value.products.map { prod ->
                if (prod.id == productId) {
                    val newStock = maxOf(0, prod.currentStock - quantity)
                    val newRisk = calculateRiskScore(newStock, prod.dailyDemand, prod.leadTimeDays, prod.safetyStock)
                    prod.copy(currentStock = newStock, riskScore = newRisk)
                } else prod
            }
            _uiState.value = _uiState.value.copy(products = updated)
        }
    }
}`,

    'build.gradle.kts': `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.google.gms.google.services)
}

android {
    namespace = "com.stockmind.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.stockmind.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    
    // Firebase Android SDK
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.firestore.ktx)
    implementation(libs.firebase.auth.ktx)

    // Google Generative AI (Gemini Android SDK)
    implementation("com.google.ai.client.generativeai:generativeai:0.9.0")
}`,

    'AndroidManifest.xml': `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="StockMind"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.StockMind">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.StockMind">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex h-[620px] w-full max-w-4xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Android Jetpack Compose Native Source
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Android Studio Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Kotlin, Jetpack Compose, Material 3 & Android Gemini SDK
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* File Tabs & Actions */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-2">
          <div className="flex gap-1.5 overflow-x-auto">
            {Object.keys(codeSnippets).map((fileName) => (
              <button
                key={fileName}
                onClick={() => setActiveFile(fileName as any)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono transition-all ${
                  activeFile === fileName
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>{fileName}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Viewer */}
        <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-xs text-slate-300 leading-relaxed no-scrollbar">
          <pre className="whitespace-pre">{codeSnippets[activeFile]}</pre>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span>Ready for Android Studio Ladybug / Meerkat (API 35, Jetpack Compose BOM 2024.10)</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-500"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
