package com.Ziyara.app;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class AnimatedSplashActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_animated_splash);

        final TextView[] letters = {
            findViewById(R.id.letterZ),
            findViewById(R.id.letterI),
            findViewById(R.id.letterY),
            findViewById(R.id.letterA1),
            findViewById(R.id.letterR),
            findViewById(R.id.letterA2)
        };

        int delay = 0;
        for (final TextView letter : letters) {
            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    letter.setVisibility(View.VISIBLE);
                    Animation anim = AnimationUtils.loadAnimation(AnimatedSplashActivity.this, R.anim.fade_in_bounce);
                    letter.startAnimation(anim);
                }
            }, delay);
            delay += 200; // 200ms delay between each letter
        }

        // Navigate to Main Activity after 3 seconds
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                Intent intent = new Intent(AnimatedSplashActivity.this, MainActivity.class);
                startActivity(intent);
                finish();
            }
        }, 3000);
    }
}
