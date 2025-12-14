<?php

/**
 * Lativ functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package Lativ
 * @since Lativ 1.0
 */


if ( ! function_exists( 'lativ_support' ) ) :

	/**
	 * Sets up theme defaults and registers support for various WordPress features.
	 *
	 * @since Lativ 1.0
	 *
	 * @return void
	 */
	function lativ_support() {

		// Enqueue editor styles.
		add_editor_style( 'style.css' );

		// Make theme available for translation.
		load_theme_textdomain( 'lativ' );
	}

endif;

add_action( 'after_setup_theme', 'lativ_support' );

if ( ! function_exists( 'lativ_styles' ) ) :

	/**
	 * Enqueue styles.
	 *
	 * @since Lativ 1.0
	 *
	 * @return void
	 */
	function lativ_styles() {

		// Register theme stylesheet.
		wp_register_style(
			'lativ-style',
			get_stylesheet_directory_uri() . '/style.css',
			array(),
			wp_get_theme()->get( 'Version' )
		);

		// Enqueue theme stylesheet.
		wp_enqueue_style( 'lativ-style' );

	}

endif;


add_action( 'wp_enqueue_scripts', 'lativ_styles' );
/*  ----------  CardioSmart Screening integration  ----------  */

// 1) Spara screening‐data vid POST
add_action('init', function(){
  if (!empty($_POST['screening_submit']) && is_user_logged_in()) {
    error_log('✅ Formulär inskickat & användare är inloggad');

    global $wpdb;
  $table = 'yqx7_screening_results'; // Hårdkoda korrekt tabellnamn
    $user  = get_current_user_id();
// Ersätt din befintliga $wpdb->insert(…)–array med denna:

$result = $wpdb->insert( $table, [
  'user_id'             => get_current_user_id(),
  'systolic'            => intval( $_POST['systolic'] ),
  'diastolic'           => intval( $_POST['diastolic'] ),
  'heartrate'           => intval( $_POST['heartrate'] ),
  'ntprobnp'            => intval( $_POST['ntprobnp'] ),
  'weight'              => intval( $_POST['weight'] ),
  'pr'                  => intval( $_POST['pr'] ),
  'qrs'                 => intval( $_POST['qrs'] ),
  'qt'                  => intval( $_POST['qt'] ),

  // --- Nya anamnes-fält ---
  'meds_regular'        => sanitize_text_field( $_POST['meds_regular']        ?? 'nej' ),
  'meds_list'           => sanitize_textarea_field( $_POST['meds_list']         ?? ''    ),
  'smoker_current'      => sanitize_text_field( $_POST['smoker_current']     ?? 'nej' ),
  'smoker_former'       => sanitize_text_field( $_POST['smoker_former']      ?? 'nej' ),
  'hypertension'        => sanitize_text_field( $_POST['hypertension']       ?? 'nej' ),
  'mi'                  => sanitize_text_field( $_POST['mi']                 ?? 'nej' ),
  'heart_surgery_past'  => sanitize_text_field( $_POST['heart_surgery_past'] ?? 'nej' ),
  'angiography'         => sanitize_text_field( $_POST['angiography']        ?? 'nej' ),
  'pci'                 => sanitize_text_field( $_POST['pci']                ?? 'nej' ),
  'pacemaker'           => sanitize_text_field( $_POST['pacemaker']          ?? 'nej' ),
  'valve_disease'       => sanitize_text_field( $_POST['valve_disease']      ?? 'nej' ),
  'heart_failure'       => sanitize_text_field( $_POST['heart_failure']      ?? 'nej' ),
  'afib'                => sanitize_text_field( $_POST['afib']               ?? 'nej' ),
  'congenital_hd'       => sanitize_text_field( $_POST['congenital_hd']      ?? 'nej' ),
  'stroke_tia'          => sanitize_text_field( $_POST['stroke_tia']         ?? 'nej' ),
  'hyperlipidemia'      => sanitize_text_field( $_POST['hyperlipidemia']     ?? 'nej' ),

  // --- Befintlig signal-kolumn ---
  'screening_result'    => sanitize_text_field( $_POST['screening_result']   ?? ''    ),
] );
  
if ( $result === false ) {
  error_log( '❌ DB-fel: ' . $wpdb->last_error );
} else {
  error_log( '✅ INSERT lyckades!' );
}



    if ( ! empty( $_POST['email_copy'] ) && is_email( $_POST['email_copy'] ) ) {
    $to      = sanitize_email( $_POST['email_copy'] );
    $subject = 'Ditt screeningsresultat från CardioSmart';

    // 1) Right From-header
    add_filter( 'wp_mail_from', function() {
    return 'noreply@cardiosmart.nu';
    });
    add_filter( 'wp_mail_from_name', function() {
    return 'CardioSmart-teamet';
    });

  // Hämta och färgkoda signalen
  $signal = sanitize_text_field( $_POST['screening_result'] );
  $colors = [
    'green'  => '#28a745',
    'yellow' => '#ffc107',
    'red'    => '#dc3545',
  ];
  $color = $colors[ $signal ] ?? '#000000';

  // 2) HTML-mail
  add_filter('wp_mail_content_type', fn() => 'text/html');

  // Dynamiskt hitta runner-dashboard
  $page = get_page_by_path( 'runner-dashboard' ) ?: get_page_by_title( 'Runner Dashboard' );
  $dashboard_url = $page ? get_permalink( $page->ID ) : home_url('/');

  // Bygg body utan någon <img>
  $body  = '<html><body style="font-family:Inter,sans-serif;color:#333;">';
  $body .= '<p>Hej!</p>';
  $body .= '<p>Tack för att du gjorde en hälsoscreening hos <strong>CardioSmart</strong>. Här är dina resultat:</p>';
  $body .= '<p>Datum: ' . date_i18n('Y-m-d H:i:s') . '</p>';
  $body .= '<p>Signal: <strong style="color:'. esc_attr($color) .'; text-transform:uppercase;">'. esc_html($signal) .'</strong></p>';

  $body .= '<h4 style="margin-top:1.5rem;">— Anamnes —</h4><ul>';
  foreach ([
    'Operation'    => 'heart_surgery',
    'Hjärtsjukdom' => 'heart_disease',
    'Bröstsmärta'  => 'chest_pain',
    'Palpitationer'=> 'palpitations',
    'Svimning'     => 'syncope',
    'Kolesterol'   => 'cholesterol',
    'Diabetes'     => 'diabetes',
    'Rökare'       => 'smoker',
    'Övrigt'       => 'other_anamnes',
  ] as $label => $field) {
    $val = $field === 'other_anamnes'
         ? nl2br(esc_html($_POST[$field]))
         : esc_html($_POST[$field]);
    $body .= "<li>{$label}: {$val}</li>";
  }
  $body .= '</ul>';

  $body .= '<h4 style="margin-top:1.5rem;">— Kliniska värden —</h4><ul>';
  $body .= '<li>Blodtryck: '. intval($_POST['systolic']).'/'.intval($_POST['diastolic']).' mmHg</li>';
  $body .= '<li>Vilopuls: '. intval($_POST['heartrate']).' bpm</li>';
  $body .= '<li>NT-proBNP: '. intval($_POST['ntprobnp']).' ng/L</li>';
  $body .= '<li>Vikt: '. intval($_POST['weight']).' kg</li>';
  $body .= '<li>PR/QRS/QT: '. intval($_POST['pr']).'/'.intval($_POST['qrs']).'/'.intval($_POST['qt']).' ms</li>';
  $body .= '</ul>';

  $body .= '<p style="margin-top:2rem;">
    <a href="'. esc_url($dashboard_url) .'" style="
      display:inline-block;
      padding:0.5rem 1rem;
      background:#1a73e8;
      color:#fff;
      text-decoration:none;
      border-radius:4px;
    ">Gå tillbaka till din Runner Dashboard</a>
  </p>';

  $body .= '<p style="margin-top:1rem;">
    Fortsätt ta hand om din hälsa och träna säkert!
  </p>';

  $body .= '<p style="margin-top:2rem;color:#777;">
    Med vänliga hälsningar,<br>CardioSmart-teamet
  </p>';
  $body .= '</body></html>';

  // Skicka mejlet
  wp_mail( $to, $subject, $body );

  // Ta bort våra filter igen så resten av WP-mail funkar normalt
  remove_filter('wp_mail_content_type', 'cs_set_html_content_type');
  remove_all_filters('wp_mail_from');
  remove_all_filters('wp_mail_from_name');
}






   // wp_redirect(home_url('/runner-dashboard'));
    //exit;
  }
});
// Byt ut din befintliga add_shortcode('runner_dashboard', …) mot detta:
// Visa alla parametrar i en scrollbar-tabell
add_shortcode('runner_dashboard', function(){
    if ( ! is_user_logged_in() ) {
        return '<p>Logga in för att se dina resultat.</p>';
    }

    global $wpdb;
    $user_id = get_current_user_id();
    $table   = 'yqx7_screening_results';
    $rows    = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT * FROM `$table` WHERE user_id = %d ORDER BY created_at DESC",
            $user_id
        )
    );

    if ( empty( $rows ) ) {
        return '<p>Du har ännu inga screeningresultat.</p>';
    }

    // Alla kolumnrubriker vi vill visa:
    $headers = [
      'created_at'           => 'Datum',
      'screening_result'     => 'Signal',
      'systolic'             => 'B/S',
      'heartrate'            => 'Puls',
      'ntprobnp'             => 'NT-proBNP',
      'weight'               => 'Vikt',
      'pr'                   => 'PR',
      'qrs'                  => 'QRS',
      'qt'                   => 'QT',
      'meds_regular'         => 'Läkemedel',
      'meds_list'            => 'Vilka',
      'smoker_current'       => 'Röker nu',
      'smoker_former'        => 'Rökt tidigare',
      'hypertension'         => 'Hypertoni',
      'mi'                   => 'Hjärtinfarkt',
      'heart_surgery_past'   => 'Hjärtkirurgi',
      'angiography'          => 'Angiografi',
      'pci'                  => 'PCI',
      'pacemaker'            => 'Pacemaker',
      'valve_disease'        => 'Klaffsjukdom',
      'heart_failure'        => 'Hjärtsvikt',
      'afib'                 => 'Förmaksflimmer',
      'congenital_hd'        => 'Medfödd H.',
      'stroke_tia'           => 'Stroke/TIA',
      'hyperlipidemia'       => 'Höga blodfetter',
      'other_anamnes'        => 'Övrigt',
    ];

    // Börja bygga HTML
    $html  = '<h3>Dina screeningresultat</h3>';
    $html .= '<div class="cardio-results-table-container">';
    $html .= '<table class="cardio-results-table"><thead><tr>';

    // Header-rad
    foreach ( $headers as $field => $label ) {
        $html .= "<th>{$label}</th>";
    }
    $html .= '</tr></thead><tbody>';

    // Varje sparad rad
    foreach ( $rows as $r ) {
        $html .= '<tr>';
        foreach ( $headers as $field => $label ) {
            $val = isset( $r->$field ) 
                   ? esc_html( $r->$field ) 
                   : '';
            // Om det är text‐fält som kan vara långt:
            if ( $field === 'meds_list' || $field === 'other_anamnes' ) {
                $val = nl2br( $val );
            }
            $html .= "<td>{$val}</td>";
        }
        $html .= '</tr>';
    }

    $html .= '</tbody></table></div>';
    return $html;
});

add_action('wp_enqueue_scripts','cs_enqueue_screening_js');
function cs_enqueue_screening_js(){
  wp_enqueue_script(
    'sweetalert2',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11',
    [],
    null,
    true
  );
  wp_enqueue_script(
    'cs-screening',
    get_stylesheet_directory_uri() . '/js/screening.js',
    ['sweetalert2'],
    null,
    true
  );
}

